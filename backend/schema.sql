DROP TABLE IF EXISTS tasks;

CREATE TABLE tasks (
  id          SERIAL        PRIMARY KEY,
  title       VARCHAR(255)  NOT NULL,
  description TEXT,
  status      VARCHAR(20)   NOT NULL DEFAULT 'todo'
                              CONSTRAINT tasks_status_check
                              CHECK (status IN ('todo', 'in-progress', 'done')),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index for filtering by status (common query pattern)
CREATE INDEX idx_tasks_status ON tasks (status);

-- Index for ordering by created_at
CREATE INDEX idx_tasks_created_at ON tasks (created_at DESC);

-- ── Seed data (optional, for local development) 
INSERT INTO tasks (title, description, status) VALUES
  ('Set up project repository',   'Initialise Git, add .gitignore and README', 'done'),
  ('Design database schema',      'Define tasks table with correct constraints', 'done'),
  ('Build REST API',               'Express routes for CRUD operations',          'in-progress'),
  ('Write Mocha test suite',       'Cover create, fetch, update and delete',      'in-progress'),
  ('Build React frontend',         'Components: TaskForm, TaskCard, TaskList',    'todo'),
  ('Write Docker setup',           'Dockerfile + docker-compose for all services','todo');