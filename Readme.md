# 📋 Team Task Tracker

A full-stack task management web application built with React, Node.js/Express, and PostgreSQL.

## Project Structure

```
team-task-tracker/
├── backend/              # Express REST API
│   ├── src/
│   │   ├── app.js        # Express app (no side effects – testable)
│   │   ├── server.js     # Entry point (starts server + DB)
│   │   ├── db/
│   │   │   └── index.js  # PostgreSQL pool + initDb()
│   │   └── routes/
│   │       └── tasks.js  # CRUD route handlers
│   ├── schema.sql         # Database schema + optional seed data
│   ├── Dockerfile
│   └── .env.example
├── frontend/             # React application
│   ├── src/
│   │   ├── App.jsx        # Root component with stats + filter tabs
│   │   ├── App.css
│   │   ├── api/tasks.js   # Fetch-based API client
│   │   ├── hooks/
│   │   │   └── useTasks.js # Custom hook – state management
│   │   └── components/
│   │       ├── TaskForm.jsx
│   │       ├── TaskCard.jsx
│   │       └── TaskList.jsx
│   ├── public/index.html
│   ├── nginx.conf
│   └── Dockerfile
├── tests/                # Mocha test suite
│   ├── tasks.test.js      # 20 tests across all endpoints
│   └── package.json
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci.yml        # GitHub Actions CI pipeline
└── README.md
```


## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/team-task-tracker.git
cd team-task-tracker
```

### 2. Set up the database

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE task_tracker;"

# Run the schema (also seeds example data)
psql -U postgres -d task_tracker -f backend/schema.sql
```

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

`.env` example:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=task_tracker
DB_USER=postgres
DB_PASSWORD=your_password
```

### 4. Start the backend

```bash
cd backend
npm install
npm start          # production
# or
npm run dev        # development (nodemon)
```

The API will be available at `http://localhost:5000`.

### 5. Start the frontend

```bash
cd frontend
npm install
npm start
```

The app will open at `http://localhost:3000`.


## Running Tests

Tests use an **in-memory stub** for the database — no real PostgreSQL connection required.

```bash
cd tests
npm install
npm test
```

Expected output:
```
  Task API
    POST /tasks – create a task
      ✔ creates a task with title only and returns 201
      ✔ creates a task with all fields
      ✔ returns 400 when title is missing
      ✔ returns 400 when title is an empty string
      ✔ returns 400 for an invalid status value
    GET /tasks – fetch all tasks
      ✔ returns an empty array when no tasks exist
      ✔ returns all created tasks
      ✔ each task has the expected fields
    GET /tasks/:id – fetch single task
      ✔ returns the correct task by ID
      ✔ returns 404 for a non-existent ID
      ✔ returns 400 for a non-numeric ID
    PUT /tasks/:id – update task
      ✔ updates the status of an existing task
      ✔ updates the title of an existing task
      ✔ marks a task as done
      ✔ returns 400 for an invalid status
      ✔ returns 404 for a non-existent task
    DELETE /tasks/:id – delete task
      ✔ deletes an existing task and returns 204
      ✔ task is no longer in the list after deletion
      ✔ returns 404 when deleting a non-existent task
    GET /health
      ✔ returns 200 with status ok

  20 passing
```

---

## API Reference

Base URL: `http://localhost:5000`

### Task model

```json
{
  "id": 1,
  "title": "Write unit tests",
  "description": "Cover all CRUD endpoints",
  "status": "todo",
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

Valid status values: `"todo"` | `"in-progress"` | `"done"`

### Endpoints

| Method | Endpoint      | Description           | Success |
|--------|---------------|-----------------------|---------|
| GET    | /tasks        | Get all tasks         | 200     |
| GET    | /tasks/:id    | Get task by ID        | 200     |
| POST   | /tasks        | Create a new task     | 201     |
| PUT    | /tasks/:id    | Update a task         | 200     |
| DELETE | /tasks/:id    | Delete a task         | 204     |
| GET    | /health       | Health check          | 200     |

### Example requests

```bash
# Get all tasks
curl http://localhost:5000/tasks

# Create a task
curl -X POST http://localhost:5000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Deploy to staging","status":"todo"}'

# Update status
curl -X PUT http://localhost:5000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"in-progress"}'

# Delete a task
curl -X DELETE http://localhost:5000/tasks/1
```



