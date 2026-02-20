package database

import (
	"fmt"
	"log"

	"github.com/HaNgocHieu0301/personal-goal/backend/internal/config"
	"github.com/HaNgocHieu0301/personal-goal/backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect(cfg config.Config) *gorm.DB {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Ho_Chi_Minh",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Details: Connected to Database")

	// Auto Migrate the schema
	err = db.AutoMigrate(&models.Goal{})
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	return db
}
