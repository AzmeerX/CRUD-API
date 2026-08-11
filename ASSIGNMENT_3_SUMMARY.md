# Assignment 3: PostgreSQL + Docker Migration ✅

## Summary

Successfully migrated the Task API from SQLite to PostgreSQL running in Docker while **keeping all routes and service logic unchanged**. This proves the architecture: routes don't know or care where data comes from.

## What Changed

### Storage Layer Only
- **Before:** SQLite (better-sqlite3) stored in `tasks.db`
- **After:** PostgreSQL (pg) in Docker with persistent volume

### Routes & Logic
- ✅ **Unchanged**: All endpoints work identically
- ✅ **Unchanged**: Validation logic, error handling
- ✅ **Unchanged**: Response formats and status codes

## Architecture: Repository Pattern

```
HTTP Request → Express Route → Repository → Database
                                  ↓
                         PostgresRepository
                                  ↓
                           Postgres Container
```

**Key idea:** Routes call repository methods. Repository can be swapped.

### Repository Interface

All database operations go through these methods:
```javascript
taskRepository.getAll()           // GET /tasks
taskRepository.getById(id)        // GET /tasks/:id
taskRepository.create(title)      // POST /tasks
taskRepository.update(id, title, done)  // PUT /tasks/:id
taskRepository.delete(id)         // DELETE /tasks/:id
taskRepository.initialize()       // Setup & seed
```

The app doesn't write SQL anymore—it calls `await taskRepository.method()`.

## Files Created/Modified

### New Files
- `postgresRepository.js` — PostgreSQL implementation of repository interface
- `docker-compose.yml` — Postgres + Node app in one command
- `Dockerfile` — Container definition for Node app
- `.env.example` — Configuration template (committed)
- `.env` — Configuration (gitignored, not committed)
- `ARCHITECTURE.md` — Explains the pattern
- `PERSISTENCE_TEST.md` — How to verify persistence

### Modified Files
- `app.js` — Refactored to use repository, now async/await
- `package.json` — Added `pg` and `dotenv` dependencies
- `README.md` — Updated with Docker setup instructions
- `.gitignore` — Added `.env` to ignore list

## Running It

### With Docker (recommended)

```bash
# Copy environment config
cp .env.example .env

# Start everything
docker compose up

# In another terminal
curl http://localhost:3000/tasks
```

Both Postgres and the Node app start together. Done.

### Without Docker (for local testing)

```bash
npm install
export DATABASE_URL=postgresql://taskuser:taskpass@localhost:5432/taskdb
npm start
```

You need to run Postgres separately.

## Proving Persistence

The real proof: data survives a container restart.

1. Create tasks via the API
2. Stop containers (`Ctrl+C`)
3. Restart (`docker compose up`)
4. Check tasks still exist

**Why it works:**
- Docker volume: `postgres_data:/var/lib/postgresql/data`
- Volume persists when containers stop
- On restart, Postgres mounts the same volume
- Data is there ✓

See `PERSISTENCE_TEST.md` for step-by-step instructions.

## Dependency Injection

The app receives the repository at startup:

```javascript
const taskRepository = new PostgresRepository(process.env.DATABASE_URL);
```

To swap implementations:
```javascript
// const taskRepository = new PostgresRepository(connectionString);
const taskRepository = new SQLiteRepository();  // Drop-in replacement
```

Routes don't care. This is why architecture matters.

## Database Initialization

On app startup:
1. `PostgresRepository.initialize()` connects to Postgres
2. Creates `tasks` table if missing
3. Seeds with 3 example tasks (only if table is empty)
4. App ready to accept requests

No manual SQL setup needed.

## Configuration

Environment variables (from `.env`):
```
DATABASE_URL=postgresql://taskuser:taskpass@postgres:5432/taskdb
NODE_ENV=development
PORT=3000
```

In Docker Compose, the app talks to `postgres` (container name) at port 5432.  
From your host, Postgres is at `localhost:5432`.

## Status Codes

All unchanged from Assignment 1:
- 200 OK (GET, PUT)
- 201 Created (POST)
- 204 No Content (DELETE)
- 400 Bad Request (validation)
- 404 Not Found (missing task)
- 500 Internal Server Error (database error)

## Commits

1. `A3: Migrate to PostgreSQL with Docker, implement repository pattern`
   - New repository class
   - Docker setup (compose + Dockerfile)
   - Refactored app.js
   - Dependencies updated

2. `A3: Remove Docker Compose version, add architecture and persistence documentation`
   - Cleaned up docker-compose.yml
   - Documentation files
   - Testing guide

## Next Steps for Production

- [ ] Add database migrations (Flyway, Alembic)
- [ ] Connection pooling optimization
- [ ] Secrets management (not in `.env`)
- [ ] Database backups strategy
- [ ] Health check endpoint
- [ ] Logging to external service

For now: this proves the pattern works. Routes don't change. Storage can.

---

**Architecture Proven** ✅  
Routes → Repository → Database  
Swap the repository, keep the routes.
