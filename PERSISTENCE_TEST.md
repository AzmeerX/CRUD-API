<!-- 
  PERSISTENCE VERIFICATION GUIDE
  
  After Docker is running, follow these steps to prove data persists
  across an app + container restart.
-->

# Testing Data Persistence

## Prerequisites
- Docker Desktop running
- `docker compose up` completed successfully
- API responding at http://localhost:3000

## Step 1: Create test data

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Verify Docker persistence"}'

curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Another test task"}'
```

Verify they're created:
```bash
curl http://localhost:3000/tasks
```

You should see:
```json
[
  {"id":1,"title":"Buy milk","done":false},
  {"id":2,"title":"Write report","done":true},
  {"id":3,"title":"Walk the dog","done":false},
  {"id":4,"title":"Verify Docker persistence","done":false},
  {"id":5,"title":"Another test task","done":false}
]
```

## Step 2: Restart everything

In the terminal running `docker compose up`, press **Ctrl+C** to stop both containers.

Wait 3 seconds, then restart:
```bash
docker compose up
```

## Step 3: Verify persistence

List tasks again:
```bash
curl http://localhost:3000/tasks
```

✅ **If you see all 5 tasks including the new ones you created, persistence worked!**

The new tasks (id 4, 5) are stored in the Postgres volume.  
When containers restart, they mount the same volume and data is there.

## Why this proves the architecture

1. **Data is in PostgreSQL**, not the app's memory
2. **App + Postgres both restarted** (containers were stopped)
3. **Data survived** → Repository pattern works
4. **Routes never changed** → Storage layer is truly swappable

## Direct database verification

You can also connect to Postgres directly to verify:

```bash
psql postgresql://taskuser:taskpass@localhost:5432/taskdb
```

Then:
```sql
SELECT * FROM tasks;
```

Or use [DBeaver](https://dbeaver.io/) with connection:
- Host: `localhost`
- Port: `5432`
- User: `taskuser`
- Password: `taskpass`
- Database: `taskdb`

