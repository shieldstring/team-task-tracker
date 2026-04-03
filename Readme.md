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
