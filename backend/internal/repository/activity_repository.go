package repository

import (
	"github.com/HaNgocHieu0301/personal-goal/backend/internal/models"
	"gorm.io/gorm"
)

type ActivityRepository struct {
	db *gorm.DB
}

func NewActivityRepository(db *gorm.DB) *ActivityRepository {
	return &ActivityRepository{db: db}
}

// GetActivityScores returns all activity logs for the heatmap
func (r *ActivityRepository) GetActivityScores() ([]models.ActivityLog, error) {
	var logs []models.ActivityLog
	// Sort by date ascending
	err := r.db.Order("date asc").Find(&logs).Error
	return logs, err
}

// SaveActivityScore saves or updates an activity score for a given date
func (r *ActivityRepository) SaveActivityScore(log *models.ActivityLog) error {
	// Upsert based on Date
	return r.db.Where("date = ?", log.Date).Assign(models.ActivityLog{
		Sessions: log.Sessions,
		Weight:   log.Weight,
		Tasks:    log.Tasks,
		Score:    log.Score,
	}).FirstOrCreate(log).Error
}
