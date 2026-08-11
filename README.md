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

The API stores tasks in `tasks.db`, a SQLite database file located in the project root. The database is created automatically on the first run.

### Database schema

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT 0
);
```

Three example tasks are inserted only on the first run. After that, the database persists and survives server restarts.

### Viewing and querying the database

To view or modify the database directly, download [DB Browser for SQLite](https://sqlitebrowser.org/) and open `tasks.db`.

### Example SQL queries

List all tasks:
```sql
SELECT * FROM tasks;
```

Output:
```
id | title        | done
---|--------------|-----
1  | Buy milk     | 0
2  | Write report | 1
3  | Walk the dog | 0
```

Show only completed tasks:
```sql
SELECT * FROM tasks WHERE done = 1;
```

Count tasks:
```sql
SELECT COUNT(*) FROM tasks;
```

Mark a task complete (in DB Browser):
```sql
UPDATE tasks SET done = 1 WHERE id = 1;
```

After any manual database change, refresh your browser and the API will immediately show the updated data.

## Swagger UI

Open http://localhost:3000/docs to explore the API interactively.
