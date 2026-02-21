package gcal

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/HaNgocHieu0301/personal-goal/backend/internal/config"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/calendar/v3"
	"google.golang.org/api/option"
)

type GoogleCalendarService interface {
	CreateAllDayEvent(title string, date time.Time) (string, error)
	UpdateAllDayEvent(eventId string, title string, date time.Time) error
	DeleteEvent(eventId string) error
}

type googleCalendarService struct {
	client     *calendar.Service
	calendarID string
}

func NewGoogleCalendarService(cfg config.Config) (GoogleCalendarService, error) {
	if cfg.GoogleClientID == "" || cfg.GoogleClientSecret == "" || cfg.GoogleRefreshToken == "" {
		log.Println("Google Calendar credentials are not fully configured. Google Calendar integration is disabled.")
		return nil, nil // Return nil service if not configured
	}

	ctx := context.Background()

	oauthCfg := &oauth2.Config{
		ClientID:     cfg.GoogleClientID,
		ClientSecret: cfg.GoogleClientSecret,
		Endpoint:     google.Endpoint,
	}

	token := &oauth2.Token{
		RefreshToken: cfg.GoogleRefreshToken,
		TokenType:    "Bearer",
		Expiry:       time.Now(), // Force refresh on first use
	}

	client := oauthCfg.Client(ctx, token)

	srv, err := calendar.NewService(ctx, option.WithHTTPClient(client))
	if err != nil {
		return nil, fmt.Errorf("unable to retrieve Calendar client: %w", err)
	}

	calendarID := cfg.GoogleCalendarID
	if calendarID == "" {
		calendarID = "primary"
	}

	return &googleCalendarService{
		client:     srv,
		calendarID: calendarID,
	}, nil
}

func (s *googleCalendarService) CreateAllDayEvent(title string, date time.Time) (string, error) {
	// Ensure the date is in the correct local timezone (Asia/Ho_Chi_Minh or System Local)
	// Because frontend sends UTC string like 2026-02-24T17:00:00Z which is Feb 25 00:00:00 locally
	loc, err := time.LoadLocation("Asia/Ho_Chi_Minh")
	if err == nil {
		date = date.In(loc)
	} else {
		date = date.Local()
	}

	// Format as YYYY-MM-DD
	dateStr := date.Format("2006-01-02")

	// To make it an all-day event, we need the end date to be the day after
	endDate := date.AddDate(0, 0, 1)
	endDateStr := endDate.Format("2006-01-02")

	event := &calendar.Event{
		Summary: title,
		Start: &calendar.EventDateTime{
			Date: dateStr,
		},
		End: &calendar.EventDateTime{
			Date: endDateStr,
		},
	}

	// Make sure calendarID exists
	if s.calendarID == "" {
		s.calendarID = "primary"
	}

	event, err = s.client.Events.Insert(s.calendarID, event).Do()
	if err != nil {
		return "", fmt.Errorf("unable to create event: %w", err)
	}

	return event.Id, nil
}

func (s *googleCalendarService) UpdateAllDayEvent(eventId string, title string, date time.Time) error {
	// Ensure the date is in the correct local timezone (Asia/Ho_Chi_Minh or System Local)
	loc, err := time.LoadLocation("Asia/Ho_Chi_Minh")
	if err == nil {
		date = date.In(loc)
	} else {
		date = date.Local()
	}

	dateStr := date.Format("2006-01-02")
	endDate := date.AddDate(0, 0, 1)
	endDateStr := endDate.Format("2006-01-02")

	event := &calendar.Event{
		Summary: title,
		Start: &calendar.EventDateTime{
			Date: dateStr,
		},
		End: &calendar.EventDateTime{
			Date: endDateStr,
		},
	}

	_, err = s.client.Events.Patch(s.calendarID, eventId, event).Do()
	if err != nil {
		return fmt.Errorf("unable to update event: %w", err)
	}

	return nil
}

func (s *googleCalendarService) DeleteEvent(eventId string) error {
	err := s.client.Events.Delete(s.calendarID, eventId).Do()
	if err != nil {
		return fmt.Errorf("unable to delete event: %w", err)
	}
	return nil
}
