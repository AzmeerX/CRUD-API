const express = require("express");
const swaggerUi = require("swagger-ui-express");
const Database = require("better-sqlite3");
const swaggerDocument = require("./openapi.json");

const app = express();
app.use(express.json({ strict: false }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Initialize database
const db = new Database("tasks.db");

// Create table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done BOOLEAN NOT NULL DEFAULT 0
  )
`);

// Insert example tasks if table is empty
const count = db.prepare("SELECT COUNT(*) as count FROM tasks").get();
if (count.count === 0) {
  const insert = db.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)");
  insert.run("Buy milk", 0);
  insert.run("Write report", 1);
  insert.run("Walk the dog", 0);
}

app.get("/", (req, res) => {
  res.json({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks"],
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/tasks", (req, res) => {
  const tasks = db.prepare("SELECT * FROM tasks").all();
  res.json(tasks);
});

app.get("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);

  if (!task) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  return res.json(task);
});

app.post("/tasks", (req, res) => {
  const { title } = req.body || {};

  if (typeof title !== "string" || title.trim() === "") {
    return res
      .status(400)
      .json({ error: "Title is required and must be a non-empty string" });
  }

  const insert = db.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)");
  const result = insert.run(title.trim(), 0);
  
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);
  return res.status(201).json(task);
});

app.put("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);

  if (!task) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res
      .status(400)
      .json({ error: "Request body must be a JSON object" });
  }

  const hasTitle = Object.prototype.hasOwnProperty.call(body, "title");
  const hasDone = Object.prototype.hasOwnProperty.call(body, "done");

  if (!hasTitle && !hasDone) {
    return res
      .status(400)
      .json({ error: "Provide title or done in the request body" });
  }

  let title = task.title;
  let done = task.done;

  if (hasTitle) {
    if (typeof body.title !== "string" || body.title.trim() === "") {
      return res
        .status(400)
        .json({ error: "Title must be a non-empty string" });
    }
    title = body.title.trim();
  }

  if (hasDone) {
    if (typeof body.done !== "boolean") {
      return res.status(400).json({ error: "Done must be a boolean" });
    }
    done = body.done;
  }

  const doneValue = done ? 1 : 0;
  db.prepare("UPDATE tasks SET title = ?, done = ? WHERE id = ?").run(title, doneValue, id);
  const updated = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  return res.json(updated);
});

app.delete("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);

  if (!task) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  return res.status(204).send();
});

app.use((err, req, res, next) => {
  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  return next(err);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
