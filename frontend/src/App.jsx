import { useState } from 'react';
import { useTasks } from './hooks/useTasks';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import './App.css';

const FILTERS = ['all', 'todo', 'in-progress', 'done'];
const FILTER_LABELS = { all: 'All', todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };

export default function App() {
  const { tasks, loading, error, addTask, updateTaskStatus, removeTask } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [globalError, setGlobalError] = useState(null);

  const handleAddTask = async (data) => {
    try {
      await addTask(data);
      setShowForm(false);
      setGlobalError(null);
    } catch (err) {
      throw err; 
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateTaskStatus(id, status);
      setGlobalError(null);
    } catch (err) {
      setGlobalError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await removeTask(id);
      setGlobalError(null);
    } catch (err) {
      setGlobalError(err.message);
    }
  };

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  const counts = tasks.reduce(
    (acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; },
    { todo: 0, 'in-progress': 0, done: 0 }
  );

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__brand">
            <span className="app-header__icon">📋</span>
            <h1>Team Task Tracker</h1>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? '✕ Cancel' : '+ New Task'}
          </button>
        </div>
      </header>

      <main className="app-main">
        {/* ── Stats bar ── */}
        <div className="stats-bar">
          <div className="stat stat--total">
            <span className="stat__value">{tasks.length}</span>
            <span className="stat__label">Total</span>
          </div>
          <div className="stat stat--todo">
            <span className="stat__value">{counts.todo}</span>
            <span className="stat__label">To Do</span>
          </div>
          <div className="stat stat--in-progress">
            <span className="stat__value">{counts['in-progress']}</span>
            <span className="stat__label">In Progress</span>
          </div>
          <div className="stat stat--done">
            <span className="stat__value">{counts.done}</span>
            <span className="stat__label">Done</span>
          </div>
        </div>

        {/* ── Create form ── */}
        {showForm && (
          <TaskForm
            onSubmit={handleAddTask}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* ── error messages ── */}
        {globalError && (
          <div className="alert alert-error">
            <strong>Error:</strong> {globalError}
            <button className="alert__close" onClick={() => setGlobalError(null)}>✕</button>
          </div>
        )}

        {/* ── Filter tabs ── */}
        <div className="filter-tabs">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'filter-tab--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {FILTER_LABELS[f]}
              {f !== 'all' && (
                <span className={`filter-tab__count badge--${f}`}>
                  {counts[f] || 0}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Task list ── */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading tasks…</p>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <strong>Failed to load tasks:</strong> {error}
            <p className="alert__hint">Make sure the backend is running on port 5000.</p>
          </div>
        ) : (
          <TaskList
            tasks={filtered}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDelete}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Team Task Tracker — {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}