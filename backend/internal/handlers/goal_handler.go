package handlers

import (
	"log"
	"net/http"

	"github.com/HaNgocHieu0301/personal-goal/backend/internal/gcal"
	"github.com/HaNgocHieu0301/personal-goal/backend/internal/models"
	"github.com/HaNgocHieu0301/personal-goal/backend/internal/repository"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type GoalHandler struct {
	repo        *repository.GoalRepository
	gcalService gcal.GoogleCalendarService
}

func NewGoalHandler(repo *repository.GoalRepository, gcalService gcal.GoogleCalendarService) *GoalHandler {
	return &GoalHandler{repo: repo, gcalService: gcalService}
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

	if h.gcalService != nil && goal.Deadline != nil {
		eventID, err := h.gcalService.CreateAllDayEvent(goal.Title, *goal.Deadline)
		if err == nil {
			goal.GoogleEventID = eventID
		} else {
			log.Printf("Failed to create Google Calendar event: %v", err)
		}
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

	// Handle Google Calendar sync
	oldGoal, err := h.repo.GetByID(id)
	if err == nil && h.gcalService != nil {
		if oldGoal.GoogleEventID != "" {
			if input.Deadline == nil {
				// Deadline removed -> delete event
				h.gcalService.DeleteEvent(oldGoal.GoogleEventID)
				input.GoogleEventID = ""
			} else if oldGoal.Deadline == nil || !oldGoal.Deadline.Equal(*input.Deadline) || oldGoal.Title != input.Title {
				// Deadline or title changed -> update event
				err := h.gcalService.UpdateAllDayEvent(oldGoal.GoogleEventID, input.Title, *input.Deadline)
				if err != nil {
					log.Printf("Failed to update Google Calendar event: %v", err)
				}
				input.GoogleEventID = oldGoal.GoogleEventID
			} else {
				input.GoogleEventID = oldGoal.GoogleEventID
			}
		} else if input.Deadline != nil {
			// Didn't have event ID, but now has deadline -> create event
			eventID, err := h.gcalService.CreateAllDayEvent(input.Title, *input.Deadline)
			if err == nil {
				input.GoogleEventID = eventID
			} else {
				log.Printf("Failed to create Google Calendar event for existing goal: %v", err)
			}
		}
	}

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

	// Try to delete from Google Calendar before db
	oldGoal, err := h.repo.GetByID(id)
	if err == nil && h.gcalService != nil && oldGoal.GoogleEventID != "" {
		err := h.gcalService.DeleteEvent(oldGoal.GoogleEventID)
		if err != nil {
			log.Printf("Failed to delete Google Calendar event: %v", err)
		}
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
