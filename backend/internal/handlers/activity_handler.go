package handlers

import (
	"net/http"

	"github.com/HaNgocHieu0301/personal-goal/backend/internal/repository"
	"github.com/gin-gonic/gin"
)

type ActivityHandler struct {
	repo *repository.ActivityRepository
}

func NewActivityHandler(repo *repository.ActivityRepository) *ActivityHandler {
	return &ActivityHandler{repo: repo}
}

// GetHeatmapData fetches activity scores to render the heatmap
func (h *ActivityHandler) GetHeatmapData(c *gin.Context) {
	logs, err := h.repo.GetActivityScores()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch heatmap data"})
		return
	}

	// Transform data into an array of {date: "YYYY-MM-DD", score: X, sessions: X, weight: X, tasks: X}
	var response []map[string]interface{}
	for _, log := range logs {
		response = append(response, map[string]interface{}{
			"date":     log.Date,
			"score":    log.Score,
			"sessions": log.Sessions,
			"weight":   log.Weight,
			"tasks":    log.Tasks,
		})
	}

	// If no data, return empty array instead of null
	if response == nil {
		response = make([]map[string]interface{}, 0)
	}

	c.JSON(http.StatusOK, response)
}
