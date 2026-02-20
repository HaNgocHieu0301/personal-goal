package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ActivityLog struct {
	ID        uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Date      string         `gorm:"type:date;uniqueIndex" json:"date"` // Format: YYYY-MM-DD
	Sessions  int            `gorm:"default:0" json:"sessions"`
	Weight    int            `gorm:"default:0" json:"weight"`
	Tasks     int            `gorm:"default:0" json:"tasks"`
	Score     float64        `gorm:"default:0" json:"score"` // (Sessions * 10) + (Weight * 0.5) + (Tasks * 5)
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
