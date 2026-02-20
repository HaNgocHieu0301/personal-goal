package handlers

import (
	"net/http"

	"github.com/HaNgocHieu0301/personal-goal/backend/internal/repository"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type DisciplineHandler struct {
	repo *repository.DisciplineRepository
}

func NewDisciplineHandler(repo *repository.DisciplineRepository) *DisciplineHandler {
	return &DisciplineHandler{repo: repo}
}

// GetStatus returns the current discipline status (if there is a pending violation)
func (h *DisciplineHandler) GetStatus(c *gin.Context) {
	violation, err := h.repo.GetPendingViolation()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check discipline status"})
		return
	}

	if violation == nil {
		c.JSON(http.StatusOK, gin.H{"status": "clear"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":    violation.Status,
		"violation": violation,
	})
}

// ResolvePayload is the expected payload for resolving a violation
type ResolvePayload struct {
	ID             uuid.UUID `json:"id" binding:"required"`
	Reason         string    `json:"reason" binding:"required"`
	CommitmentText string    `json:"commitmentText" binding:"required"`
}

const expectedCommitment = "Tôi xác nhận đã nộp phạt vào quỹ tự phạt và cam kết sẽ kỷ luật hơn."

// Resolve handles the resolution of a pending Beast Mode violation
func (h *DisciplineHandler) Resolve(c *gin.Context) {
	var payload ResolvePayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
		return
	}

	if payload.CommitmentText != expectedCommitment {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Văn bản cam kết không khớp"})
		return
	}

	if len(payload.Reason) < 10 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Lý do thất bại phải dài hơn 10 ký tự"})
		return
	}

	err := h.repo.ResolveViolation(payload.ID, payload.Reason)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to resolve violation"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Violation resolved successfully"})
}
