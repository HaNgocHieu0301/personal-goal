package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Goal struct {
	ID                uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ParentID          *uuid.UUID     `gorm:"type:uuid;index" json:"parentId"`
	Title             string         `gorm:"not null" json:"title"`
	Description       string         `json:"description"`
	Status            string         `gorm:"default:'todo'" json:"status"` // todo, in-progress, done
	Progress          int            `gorm:"default:0" json:"progress"`
	Weight            int            `gorm:"default:100" json:"weight"`
	IsFocus           bool           `gorm:"default:false" json:"isFocus"` // Identify critical tasks for Warrior Mode
	TargetSessions    int            `gorm:"default:0" json:"targetSessions"`
	CompletedSessions int            `gorm:"default:0" json:"completedSessions"`
	TargetPeriod      string         `gorm:"type:varchar(20);index" json:"targetPeriod"` // Format: YYYY-MM
	Deadline          *time.Time     `json:"deadline"`
	CreatedAt         time.Time      `json:"createdAt"`
	UpdatedAt         time.Time      `json:"updatedAt"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"-"`

	// Self-referencing relationship
	Children []Goal `gorm:"foreignKey:ParentID" json:"children,omitempty"`
}
