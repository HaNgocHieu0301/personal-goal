package services

import (
	"fmt"
	"log"
	"time"

	"github.com/HaNgocHieu0301/personal-goal/backend/internal/config"
	"github.com/HaNgocHieu0301/personal-goal/backend/internal/models"
	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
	"github.com/google/uuid"
	"github.com/robfig/cron/v3"
	"gorm.io/gorm"
)

type NotificationService struct {
	db     *gorm.DB
	cfg    config.Config
	bot    *tgbotapi.BotAPI
	chatID int64
}

func NewNotificationService(db *gorm.DB, cfg config.Config) *NotificationService {
	var bot *tgbotapi.BotAPI
	var chatID int64
	var err error

	if cfg.TelegramBotToken != "" && cfg.TelegramChatID != "" {
		bot, err = tgbotapi.NewBotAPI(cfg.TelegramBotToken)
		if err != nil {
			log.Printf("Warning: Failed to initialize Telegram Bot: %v\n", err)
		} else {
			// Convert ChatID to int64
			fmt.Sscanf(cfg.TelegramChatID, "%d", &chatID)
			log.Printf("Authorized Telegram Bot on account %s", bot.Self.UserName)
		}
	}

	return &NotificationService{
		db:     db,
		cfg:    cfg,
		bot:    bot,
		chatID: chatID,
	}
}

func (s *NotificationService) SendMessage(text string) {
	if s.bot == nil || s.chatID == 0 {
		return
	}
	msg := tgbotapi.NewMessage(s.chatID, text)
	if _, err := s.bot.Send(msg); err != nil {
		log.Printf("Error sending telegram message: %v\n", err)
	}
}

// StartCronJobs starts the notification system
func (s *NotificationService) StartCronJobs() {
	c := cron.New(cron.WithLocation(time.Local))

	// 1. 20:00 - Cảnh báo tổng hợp
	c.AddFunc("0 20 * * *", func() { s.checkAndWarn("Cảnh báo Tổng Hợp (20:00)") })

	// 2. 20:30, 21:00, 21:30 - Nhắc nhở leo thang
	c.AddFunc("30 20 * * *", func() { s.checkAndWarn("Cảnh báo Leo Thang (20:30) ⚠️") })
	c.AddFunc("0 21 * * *", func() { s.checkAndWarn("Cảnh báo Leo Thang (21:00) ⚠️") })
	c.AddFunc("30 21 * * *", func() { s.checkAndWarn("Cảnh báo Leo Thang (21:30) ⚠️") })

	// 3. 22:00 -> 23:45 Mỗi 15 phút - Giục giã cường độ cao
	c.AddFunc("*/15 22-23 * * *", func() { s.checkAndWarn("🚨 [BÁO ĐỘNG ĐỎ] - GẦN HẾT NGÀY! 🚨") })

	// 4. 00:00 - Chốt sổ vi phạm (Beast Mode Lock)
	c.AddFunc("0 0 * * *", func() { s.checkAndEnforceViolation() })

	c.Start()
	log.Println("Notification Cron Service started successfully.")
}

func (s *NotificationService) getIncompleteToday() (int, int, []uuid.UUID) {
	todayStart := time.Now().Truncate(24 * time.Hour)
	todayEnd := todayStart.Add(24 * time.Hour).Add(-time.Nanosecond)

	var incompleteTasks []models.Goal

	// Query: Find tasks where Status != 'done' AND
	// (Deadline is today OR (ParentID is null AND TargetPeriod is null AND CreatedAt is today))
	s.db.Where("status != ?", "done").
		Where("(deadline BETWEEN ? AND ?) OR (parent_id IS NULL AND target_period = '' AND created_at BETWEEN ? AND ?)",
			todayStart, todayEnd, todayStart, todayEnd).
		Find(&incompleteTasks)

	missingSessions := 0
	taskCount := len(incompleteTasks)
	var taskIds []uuid.UUID

	for _, t := range incompleteTasks {
		taskIds = append(taskIds, t.ID)
		if t.TargetSessions > 0 {
			rem := t.TargetSessions - t.CompletedSessions
			if rem > 0 {
				missingSessions += rem
			}
		}
	}

	// Also check focused goals that have missing sessions today
	var focusTasks []models.Goal
	s.db.Where("is_focus = ?", true).Where("status != ?", "done").Find(&focusTasks)
	for _, t := range focusTasks {
		if t.TargetSessions > 0 {
			rem := t.TargetSessions - t.CompletedSessions
			if rem > 0 {
				// Don't double count if it's already in incompleteTasks
				found := false
				for _, it := range incompleteTasks {
					if it.ID == t.ID {
						found = true
						break
					}
				}
				if !found {
					missingSessions += rem
					taskCount++
					taskIds = append(taskIds, t.ID)
				}
			}
		}
	}

	return taskCount, missingSessions, taskIds
}

func (s *NotificationService) checkAndWarn(prefix string) {
	taskCount, missingSessions, _ := s.getIncompleteToday()

	if taskCount == 0 && missingSessions == 0 {
		return // All clear!
	}

	msg := fmt.Sprintf("%s\n\nBạn chưa hoàn thành mục tiêu ngày hôm nay:\n- Thiếu <b>%d</b> sessions (phiên tập trung)\n- Còn <b>%d</b> tasks chưa xử lý.\n\nHãy tập trung giải quyết ngay trước 00:00 để tránh bị phạt!", prefix, missingSessions, taskCount)

	if s.bot != nil {
		tgMsg := tgbotapi.NewMessage(s.chatID, msg)
		tgMsg.ParseMode = "HTML"
		s.bot.Send(tgMsg)
	}
}

func (s *NotificationService) checkAndEnforceViolation() {
	// Check yesterday's stats (since this runs at 00:00)
	yesterdayStart := time.Now().Add(-24 * time.Hour).Truncate(24 * time.Hour)
	yesterdayEnd := yesterdayStart.Add(24 * time.Hour).Add(-time.Nanosecond)

	var incompleteTasks []models.Goal

	s.db.Where("status != ?", "done").
		Where("(deadline BETWEEN ? AND ?) OR (parent_id IS NULL AND target_period = '' AND created_at BETWEEN ? AND ?)",
			yesterdayStart, yesterdayEnd, yesterdayStart, yesterdayEnd).
		Find(&incompleteTasks)

	missingSessions := 0
	taskCount := len(incompleteTasks)

	// Combine logic with focus tasks
	var focusTasks []models.Goal
	s.db.Where("is_focus = ?", true).Where("status != ?", "done").Find(&focusTasks)
	for _, t := range focusTasks {
		if t.TargetSessions > 0 {
			rem := t.TargetSessions - t.CompletedSessions
			if rem > 0 {
				found := false
				for _, it := range incompleteTasks {
					if it.ID == t.ID {
						found = true
						break
					}
				}
				if !found {
					missingSessions += rem
					taskCount++
				}
			}
		}
	}

	if taskCount > 0 || missingSessions > 0 {
		// Create a violation log for yesterday
		dateStr := yesterdayStart.Format("2006-01-02")

		var count int64
		s.db.Model(&models.ViolationLog{}).Where("date = ?", dateStr).Count(&count)

		if count == 0 {
			violation := &models.ViolationLog{
				Date:   dateStr,
				Status: "pending",
			}
			s.db.Create(violation)
			log.Printf("Enforced Beast Mode lock for %s due to %d remaining tasks and %d missing sessions.\n", dateStr, taskCount, missingSessions)

			s.SendMessage(fmt.Sprintf("❌ ĐÃ CHỐT SỔ (Ngày %s) ❌\n\nBạn đã vi phạm kỷ luật. Ứng dụng đã bị khóa (Beast Mode).\nVui lòng nhập lý do và xác nhận nộp phạt để mở lốc!", dateStr))
		}
	} else {
		// Calculate and record ActivityScore
		dateStr := yesterdayStart.Format("2006-01-02")
		// Fetch completed tasks to score
		var doneTasks []models.Goal
		s.db.Where("status = ?", "done").
			Where("updated_at BETWEEN ? AND ?", yesterdayStart, yesterdayEnd).
			Find(&doneTasks)

		totalWeight := 0
		totalSessions := 0
		for _, t := range doneTasks {
			totalWeight += t.Weight
			totalSessions += t.CompletedSessions
		}

		score := float64(totalSessions*10) + float64(totalWeight)*0.5 + float64(len(doneTasks)*5)

		activityLog := &models.ActivityLog{
			Date:     dateStr,
			Sessions: totalSessions,
			Weight:   totalWeight,
			Tasks:    len(doneTasks),
			Score:    score,
		}

		s.db.Where("date = ?", dateStr).Assign(models.ActivityLog{
			Sessions: activityLog.Sessions,
			Weight:   activityLog.Weight,
			Tasks:    activityLog.Tasks,
			Score:    activityLog.Score,
		}).FirstOrCreate(activityLog)

		s.SendMessage(fmt.Sprintf("✅ CHÚC MỪNG HOÀN THÀNH (Ngày %s) ✅\n\nGiữ lửa nào! Hôm qua bạn đã done %d tasks, score: %.1f", dateStr, len(doneTasks), score))
	}
}
