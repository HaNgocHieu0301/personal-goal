package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ViolationLog struct {
	ID        uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Date      string         `gorm:"type:date;uniqueIndex" json:"date"` // Format: YYYY-MM-DD
	Status    string         `gorm:"default:'pending'" json:"status"`   // pending, resolved
	Reason    string         `json:"reason"`                            // User provided reason for failure
	TasksRef  string         `json:"tasksRef"`                          // JSON array of task IDs that caused violation
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
