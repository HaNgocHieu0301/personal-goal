package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/HaNgocHieu0301/personal-goal/backend/internal/config"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/calendar/v3"
	"google.golang.org/api/option"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	fmt.Println("==================================================")
	fmt.Println("🔍 BẮT ĐẦU KIỂM TRA GOOGLE CALENDAR CREDENTIALS...")
	fmt.Println("==================================================")
	fmt.Printf("1. Client ID đã điền:     %v (Độ dài: %d)\n", cfg.GoogleClientID != "", len(cfg.GoogleClientID))
	fmt.Printf("2. Client Secret đã điền: %v (Độ dài: %d)\n", cfg.GoogleClientSecret != "", len(cfg.GoogleClientSecret))
	fmt.Printf("3. Refresh Token đã điền: %v (Độ dài: %d)\n", cfg.GoogleRefreshToken != "", len(cfg.GoogleRefreshToken))
	fmt.Printf("4. Calendar ID đã điền:   %v (Độ dài: %d, Giá trị: '%s')\n", cfg.GoogleCalendarID != "", len(cfg.GoogleCalendarID), cfg.GoogleCalendarID)
	fmt.Println("--------------------------------------------------")

	ctx := context.Background()

	oauthCfg := &oauth2.Config{
		ClientID:     cfg.GoogleClientID,
		ClientSecret: cfg.GoogleClientSecret,
		Endpoint:     google.Endpoint,
	}

	token := &oauth2.Token{
		RefreshToken: cfg.GoogleRefreshToken,
		TokenType:    "Bearer",
		Expiry:       time.Now().Add(-1 * time.Hour), // Ensure it's expired so it must refresh
	}

	// Phase 1: Thử lấy Access Token mới từ Refresh Token
	fmt.Println("⏳ Đang thử Request lấy Access Token mới từ Google...")
	tokenSource := oauthCfg.TokenSource(ctx, token)
	newToken, err := tokenSource.Token()
	if err != nil {
		fmt.Printf("\n❌ LỖI NGHIÊM TRỌNG TẠI BƯỚC XÁC THỰC OAUTH2:\n%v\n\n", err)
		fmt.Println("📌 CÁC LÝ DO PHỔ BIẾN CHO LỖI NÀY:")
		fmt.Println("  1. Client ID hoặc Client Secret không khớp với Refresh Token bạn đang dùng.")
		fmt.Println("  2. Refresh Token đã hết hạn, bị thu hồi (Do bạn lỡ tay revoke) hoặc lấy sai cách.")
		fmt.Println("  3. Application Type của Client ID này trên Google Cloud KHÔNG PHẢI là 'Web application' hoặc 'Desktop app'.")
		fmt.Println("  4. Có ký tự lạ (khoảng trắng / dấu tab) bị dư khi bạn copy-paste vào file .env.")
		log.Fatal("Kiểm tra dừng lại.")
	}

	fmt.Printf("✅ LẤY TOKEN THÀNH CÔNG! (Sẽ hết hạn vào: %v)\n", newToken.Expiry)
	fmt.Println("--------------------------------------------------")

	client := oauthCfg.Client(ctx, token)
	srv, err := calendar.NewService(ctx, option.WithHTTPClient(client))
	if err != nil {
		log.Fatalf("❌ Lỗi cấu hình Google Calendar Service: %v", err)
	}

	calendarID := cfg.GoogleCalendarID
	if calendarID == "" {
		calendarID = "primary"
	}

	// Phase 2: Thử truy cập vào Calendar API
	fmt.Printf("⏳ Đang thử truy xuất Lịch '%s'...\n", calendarID)
	cal, err := srv.Calendars.Get(calendarID).Do()
	if err != nil {
		fmt.Printf("\n❌ LỖI KHÔNG THỂ TRUY XUẤT CALENDAR API:\n%v\n\n", err)
		fmt.Println("📌 CẢNH BÁO MẶC DÙ TOKEN LÀ ĐÚNG:")
		fmt.Println("  1. Lỗi phân quyền API (Bạn chưa chọn đúng Scope 'https://www.googleapis.com/auth/calendar.events' lúc lấy token).")
		fmt.Println("  2. Calendar ID bạn cấutrong .env không tồn tại hoặc tài khoản lấy Token không có quyền truy cập lịch này.")
		fmt.Println("  3. Google Calendar API chưa được Enable trong Project trên Google Cloud.")
		log.Fatal("Kiểm tra dừng lại.")
	}

	fmt.Printf("✅ KẾT NỐI API THÀNH CÔNG! Lịch tìm thấy: '%s'\n", cal.Summary)
	fmt.Println("==================================================")
	fmt.Println("TẤT CẢ CẤU HÌNH ĐỀU CHÍNH XÁC HOÀN TOÀN! 🚀")
	fmt.Println("==================================================")
}
