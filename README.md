# Task API

A small Express-based CRUD API for managing tasks, with Swagger UI available at `/docs`. Tasks are persisted in PostgreSQL running in Docker.

## Architecture: Repository Pattern

The API implements **repository pattern** to separate business logic from storage. This proves a critical architectural principle:

**All API routes remain unchanged** — only the storage layer changed from SQLite to PostgreSQL. The service never knows or cares where data comes from.

- **Routes** (`app.js`): Identical to previous version
- **Repository** (`postgresRepository.js`): Handles all database communication
- **Dependency**: Injected at startup, swappable

This is how real backends work: switch databases, switch repositories, routes stay the same.

## Prerequisites

- Docker Desktop (or Docker + Docker Compose)
- 5432 port available (PostgreSQL)
- 3000 port available (Node app)

## Install and run (with Docker)

```bash
# Copy environment template
cp .env.example .env

# Start everything (Postgres + app)
docker compose up
```

The API will be available at `http://localhost:3000` and Postgres at `localhost:5432`.

### Local development (without Docker)

If you want to run locally against a Docker Postgres:

```bash
npm install
docker run -e POSTGRES_PASSWORD=taskpass -e POSTGRES_DB=taskdb -e POSTGRES_USER=taskuser -p 5432:5432 postgres:15-alpine
# In another terminal:
npm start
```

The app reads `DATABASE_URL` from `.env` — update it if your Postgres is elsewhere.

## Endpoints

| Method | Path         | Description    |
| ------ | ------------ | -------------- |
| GET    | `/`          | API metadata   |
| GET    | `/health`    | Health check   |
| GET    | `/tasks`     | List all tasks |
| GET    | `/tasks/:id` | Get one task   |
| POST   | `/tasks`     | Create a task  |
| PUT    | `/tasks/:id` | Update a task  |
| DELETE | `/tasks/:id` | Delete a task  |

## Example request

```bash
curl -i http://localhost:3000/tasks/1
```

Example response:

```text
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":1,"title":"Buy milk","done":false}
```

## Database & Persistence

### Architecture

Data persists across restarts:

- **Docker:** PostgreSQL container uses a named volume (`postgres_data`). Container data survives restarts.
- **Schema:** Created automatically on first run by `postgresRepository.js`
- **Example data:** Three sample tasks inserted only if table is empty

### Verify Persistence

Create a task and verify it survives a restart:

```bash
# Start the stack
docker compose up

# In another terminal, create a task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Does this persist?"}'

# Back in the docker terminal, press Ctrl+C to stop

# Restart
docker compose up

# List tasks
curl http://localhost:3000/tasks

# Task is still there ✓ Postgres saved it to the volume
```

### Connect to Postgres Directly

From your host machine:

```bash
psql postgresql://taskuser:taskpass@localhost:5432/taskdb
```

Inside psql:
```sql
\dt  -- list tables
SELECT * FROM tasks;  -- see all tasks
```

Or use a GUI like [DBeaver](https://dbeaver.io/) or [pgAdmin](https://www.pgadmin.org/) with:
- Host: `localhost`
- Port: `5432`
- User: `taskuser`
- Password: `taskpass`
- Database: `taskdb`

## Swagger UI

Open http://localhost:3000/docs to explore the API interactively.
