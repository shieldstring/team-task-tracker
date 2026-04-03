const express = require('express');
const router = express.Router();
const db = require('../db');

const VALID_STATUSES = ['todo', 'in-progress', 'done'];

// GET /tasks — fetch all tasks, newest first
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM tasks ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /tasks error:', err);
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

// GET /tasks/:id — fetch a single task
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid task ID' });

  try {
    const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /tasks/:id error:', err);
    res.status(500).json({ error: 'Failed to retrieve task' });
  }
});

// POST /tasks — create a new task
router.post('/', async (req, res) => {
  const { title, description, status = 'todo' } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
    });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO tasks (title, description, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title.trim(), description || null, status]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /tasks error:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /tasks/:id — update task (status and/or other fields)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid task ID' });

  const { title, description, status } = req.body;

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
    });
  }
  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({ error: 'Title cannot be empty' });
  }

  try {
    // Check task exists
    const existing = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (existing.rows.length === 0)
      return res.status(404).json({ error: 'Task not found' });

    const current = existing.rows[0];
    const newTitle = title !== undefined ? title.trim() : current.title;
    const newDesc = description !== undefined ? description : current.description;
    const newStatus = status !== undefined ? status : current.status;

    const { rows } = await db.query(
      `UPDATE tasks
       SET title = $1, description = $2, status = $3
       WHERE id = $4
       RETURNING *`,
      [newTitle, newDesc, newStatus, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT /tasks/:id error:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /tasks/:id — delete a task
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid task ID' });

  try {
    const { rowCount } = await db.query(
      'DELETE FROM tasks WHERE id = $1',
      [id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Task not found' });
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /tasks/:id error:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;