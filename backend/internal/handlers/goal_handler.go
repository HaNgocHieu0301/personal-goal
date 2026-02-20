package handlers

import (
	"net/http"

	"github.com/HaNgocHieu0301/personal-goal/backend/internal/models"
	"github.com/HaNgocHieu0301/personal-goal/backend/internal/repository"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type GoalHandler struct {
	repo *repository.GoalRepository
}

func NewGoalHandler(repo *repository.GoalRepository) *GoalHandler {
	return &GoalHandler{repo: repo}
}

// GetGoals fetches all goals
func (h *GoalHandler) GetGoals(c *gin.Context) {
	goals, err := h.repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch goals"})
		return
	}
	c.JSON(http.StatusOK, goals)
}

// CreateGoal handles new goal creation
func (h *GoalHandler) CreateGoal(c *gin.Context) {
	var goal models.Goal
	if err := c.ShouldBindJSON(&goal); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.repo.Create(&goal); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create goal"})
		return
	}

	c.JSON(http.StatusCreated, goal)
}

// UpdateGoal handles existing goal updates
func (h *GoalHandler) UpdateGoal(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID"})
		return
	}

	var input models.Goal
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Ensure ID matches
	input.ID = id

	if err := h.repo.Update(&input); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update goal"})
		return
	}

	c.JSON(http.StatusOK, input)
}

// DeleteGoal removes a goal
func (h *GoalHandler) DeleteGoal(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID"})
		return
	}

	if err := h.repo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete goal"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Goal deleted"})
}

// ToggleFocus flips IsFocus state
func (h *GoalHandler) ToggleFocus(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID"})
		return
	}

	goal, err := h.repo.ToggleFocus(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to toggle focus"})
		return
	}

	c.JSON(http.StatusOK, goal)
}
