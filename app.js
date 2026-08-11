const express = require("express");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();
const PostgresRepository = require("./postgresRepository");
const swaggerDocument = require("./openapi.json");

const app = express();
app.use(express.json({ strict: false }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Initialize repository
const taskRepository = new PostgresRepository(process.env.DATABASE_URL);

// Initialize database on startup
let initialized = false;
taskRepository.initialize().then(() => {
  initialized = true;
  console.log("Database initialized");
}).catch((err) => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});

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

app.get("/tasks", async (req, res) => {
  try {
    const tasks = await taskRepository.getAll();
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.get("/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const task = await taskRepository.getById(id);

    if (!task) {
      return res.status(404).json({ error: `Task ${id} not found` });
    }

    return res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

app.post("/tasks", async (req, res) => {
  try {
    const { title } = req.body || {};

    if (typeof title !== "string" || title.trim() === "") {
      return res
        .status(400)
        .json({ error: "Title is required and must be a non-empty string" });
    }

    const task = await taskRepository.create(title.trim());
    return res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.put("/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const task = await taskRepository.getById(id);

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

    const updated = await taskRepository.update(id, title, done);
    return res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const task = await taskRepository.getById(id);

    if (!task) {
      return res.status(404).json({ error: `Task ${id} not found` });
    }

    await taskRepository.delete(id);
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

app.use((err, req, res, next) => {
  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  return next(err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
