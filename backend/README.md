# Personal Goal OS - Backend

This is the Golang backend for the Personal Goal OS.

## 🛠️ Stack

- **Golang 1.22+**
- **Gin** (HTTP framework)
- **GORM** (ORM for PostgreSQL)
- **PostgreSQL 16** (Primary Database)
- **Redis** (Caching/Session store)
- **Docker** (Containterization)

## 📂 Structure

- `cmd/api/main.go`: Entry point and route definitions.
- `internal/config`: Configuration management.
- `internal/database`: Database initialization and connection logic.
- `internal/models`: Domain models and GORM structures.
- `internal/handlers`: Controller logic for API endpoints.
- `internal/repositories`: Database abstraction layer.

## 🚀 Running with Docker

The easiest way to run the backend and its dependencies is using Docker Compose at the root of the project:

```bash
docker compose up -d
```

## 🛠️ Local Development (Outside Docker)

If you want to run the Go server locally:

1. Ensure Postgres and Redis are running.
2. Update `.env` or environment variables for DB connection.
3. Run:
```bash
go run cmd/api/main.go
```
