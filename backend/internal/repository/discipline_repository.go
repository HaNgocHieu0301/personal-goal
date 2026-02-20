package repository

import (
	"github.com/HaNgocHieu0301/personal-goal/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type DisciplineRepository struct {
	db *gorm.DB
}

func NewDisciplineRepository(db *gorm.DB) *DisciplineRepository {
	return &DisciplineRepository{db: db}
}

// GetPendingViolation fetches the currently pending violation log, if any
func (r *DisciplineRepository) GetPendingViolation() (*models.ViolationLog, error) {
	var violation models.ViolationLog
	err := r.db.Where("status = ?", "pending").First(&violation).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil // No pending violation
		}
		return nil, err
	}
	return &violation, nil
}

// ResolveViolation updates the violation status to resolved and saves the reason
func (r *DisciplineRepository) ResolveViolation(id uuid.UUID, reason string) error {
	return r.db.Model(&models.ViolationLog{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status": "resolved",
		"reason": reason,
	}).Error
}

// CreateViolation creates a new violation record (used by Cronjob)
func (r *DisciplineRepository) CreateViolation(violation *models.ViolationLog) error {
	return r.db.Create(violation).Error
}

// HasViolationForDate checks if a violation already exists for a specific date
func (r *DisciplineRepository) HasViolationForDate(date string) (bool, error) {
	var count int64
	err := r.db.Model(&models.ViolationLog{}).Where("date = ?", date).Count(&count).Error
	return count > 0, err
}
