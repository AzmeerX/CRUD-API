# Task API

A small Express-based CRUD API for managing tasks, with Swagger UI available at `/docs`. Tasks are persisted in a SQLite database.

## Why SQLite

SQLite is a lightweight, file-based database that requires no separate server. It's perfect for small projects and development. The database file (`tasks.db`) is created automatically on the first run.

## Install and run

```bash
npm install
npm start
```

The server runs on `http://localhost:3000`. The database file `tasks.db` is created automatically in the project root on first run.

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

## Database

The API stores tasks in `tasks.db`, a SQLite database file. Three example tasks are inserted on the first run. To view or modify the database directly, use a SQLite viewer like [DB Browser for SQLite](https://sqlitebrowser.org/).

### Example SQL queries

List all tasks:
```sql
SELECT * FROM tasks;
```

Show only completed tasks:
```sql
SELECT * FROM tasks WHERE done = 1;
```

Update all tasks to completed:
```sql
UPDATE tasks SET done = 1;
```

## Swagger UI

Open http://localhost:3000/docs to explore the API interactively.
