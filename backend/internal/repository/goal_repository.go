package repository

import (
	"github.com/HaNgocHieu0301/personal-goal/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type GoalRepository struct {
	db *gorm.DB
}

func NewGoalRepository(db *gorm.DB) *GoalRepository {
	return &GoalRepository{db: db}
}

// Create adds a new goal to the database
func (r *GoalRepository) Create(goal *models.Goal) error {
	return r.db.Create(goal).Error
}

// GetAll fetches all goals (flat list). Tree assembly can happen in service/handler for now.
// Or we can pre-load children if depth is small.
// For now, let's fetch all and let frontend/handler reconstruct, OR providing a simple list is sometimes enough.
// Actually, for Architect view, we need the tree.
// Let's just return all goals for now.
func (r *GoalRepository) GetAll() ([]models.Goal, error) {
	var goals []models.Goal
	// Preload children is tricky for infinite depth without recursive CTE.
	// Easiest for MVP: Fetch ALL goals and build tree in Go or JS.
	// Let's just fetch all sorted by creation.
	err := r.db.Find(&goals).Error
	return goals, err
}

// GetByID fetches a specific goal
func (r *GoalRepository) GetByID(id uuid.UUID) (*models.Goal, error) {
	var goal models.Goal
	err := r.db.First(&goal, "id = ?", id).Error
	return &goal, err
}

// Update modifies an existing goal
func (r *GoalRepository) Update(goal *models.Goal) error {
	return r.db.Save(goal).Error
}

// Delete removes a goal (and potentially its children if cascade is set, but GORM soft delete handles it differently)
func (r *GoalRepository) Delete(id uuid.UUID) error {
	// If we want cascade delete, we might need to hook or configure FK constraint.
	// For now, simple delete.
	return r.db.Delete(&models.Goal{}, "id = ?", id).Error
}

// ToggleFocus flips the IsFocus bit
func (r *GoalRepository) ToggleFocus(id uuid.UUID) (*models.Goal, error) {
	var goal models.Goal
	if err := r.db.First(&goal, "id = ?", id).Error; err != nil {
		return nil, err
	}
	goal.IsFocus = !goal.IsFocus
	if err := r.db.Save(&goal).Error; err != nil {
		return nil, err
	}
	return &goal, nil
}
