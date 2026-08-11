const { Pool } = require("pg");

class PostgresRepository {
  constructor(connectionString) {
    this.pool = new Pool({
      connectionString,
    });
  }

  async initialize() {
    const client = await this.pool.connect();
    try {
      // Create table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          done BOOLEAN NOT NULL DEFAULT false
        )
      `);

      // Insert example tasks if table is empty
      const result = await client.query("SELECT COUNT(*) FROM tasks");
      if (result.rows[0].count === "0") {
        await client.query(
          "INSERT INTO tasks (title, done) VALUES ($1, $2), ($3, $4), ($5, $6)",
          ["Buy milk", false, "Write report", true, "Walk the dog", false]
        );
      }
    } finally {
      client.release();
    }
  }

  async getAll() {
    const result = await this.pool.query("SELECT * FROM tasks ORDER BY id");
    return result.rows;
  }

  async getById(id) {
    const result = await this.pool.query(
      "SELECT * FROM tasks WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  }

  async create(title) {
    const result = await this.pool.query(
      "INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *",
      [title, false]
    );
    return result.rows[0];
  }

  async update(id, title, done) {
    const result = await this.pool.query(
      "UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *",
      [title, done, id]
    );
    return result.rows[0] || null;
  }

  async delete(id) {
    const result = await this.pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0] || null;
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = PostgresRepository;
