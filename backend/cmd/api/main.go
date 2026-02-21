package main

import (
	"fmt"
	"log"

	"github.com/HaNgocHieu0301/personal-goal/backend/internal/config"
	"github.com/HaNgocHieu0301/personal-goal/backend/internal/database"
	"github.com/HaNgocHieu0301/personal-goal/backend/internal/handlers"
	"github.com/HaNgocHieu0301/personal-goal/backend/internal/repository"
	"github.com/HaNgocHieu0301/personal-goal/backend/internal/services"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// 1. Load Config
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// 2. Connect Database
	db := database.Connect(cfg)
	if db == nil {
		log.Fatal("Failed to connect to database")
	}

	// 3. Setup Repository & Handler
	goalRepo := repository.NewGoalRepository(db)
	goalHandler := handlers.NewGoalHandler(goalRepo)

	disciplineRepo := repository.NewDisciplineRepository(db)
	disciplineHandler := handlers.NewDisciplineHandler(disciplineRepo)

	activityRepo := repository.NewActivityRepository(db)
	activityHandler := handlers.NewActivityHandler(activityRepo)

	// 3.5 Start Background Services
	notificationService := services.NewNotificationService(db, cfg)
	notificationService.StartCronJobs()

	// 4. Setup Router
	r := gin.Default()

	// 4.5 CORS Middleware
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000", cfg.FrontendURL}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(config))

	// 5. Routes
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
			"db":     "connected",
		})
	})

	api := r.Group("/api/v1")
	{
		goals := api.Group("/goals")
		{
			goals.POST("", goalHandler.CreateGoal)
			goals.GET("", goalHandler.GetGoals)
			goals.PUT("/:id", goalHandler.UpdateGoal)
			goals.DELETE("/:id", goalHandler.DeleteGoal)
			goals.PATCH("/:id/focus", goalHandler.ToggleFocus)
		}

		discipline := api.Group("/discipline")
		{
			discipline.GET("/status", disciplineHandler.GetStatus)
			discipline.POST("/resolve", disciplineHandler.Resolve)
		}

		activity := api.Group("/activity")
		{
			activity.GET("/heatmap", activityHandler.GetHeatmapData)
		}
	}

	// 5. Start Server
	log.Printf("Starting server on port %s", cfg.AppPort)
	if err := r.Run(fmt.Sprintf(":%s", cfg.AppPort)); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
