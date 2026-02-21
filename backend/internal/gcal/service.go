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

	event, err := s.client.Events.Insert(s.calendarID, event).Do()
	if err != nil {
		return "", fmt.Errorf("unable to create event: %w", err)
	}

	return event.Id, nil
}

func (s *googleCalendarService) UpdateAllDayEvent(eventId string, title string, date time.Time) error {
	dateStr := date.Format("2006-01-02")
	endDate := date.AddDate(0, 0, 1)
	endDateStr := endDate.Format("2006-01-02")

	// Get existing event
	event, err := s.client.Events.Get(s.calendarID, eventId).Do()
	if err != nil {
		return fmt.Errorf("unable to get event to update: %w", err)
	}

	// Update fields
	event.Summary = title
	event.Start = &calendar.EventDateTime{Date: dateStr}
	event.End = &calendar.EventDateTime{Date: endDateStr}
	event.Start.DateTime = "" // Clear these just in case they were set
	event.End.DateTime = ""

	_, err = s.client.Events.Update(s.calendarID, event.Id, event).Do()
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
