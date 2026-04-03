import { useState } from 'react';

const STATUSES = ['todo', 'in-progress', 'done'];

const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };

export default function TaskCard({ task, onUpdateStatus, onDelete }) {
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setUpdating(true);
    setError(null);
    try {
      await onUpdateStatus(task.id, newStatus);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setDeleting(true);
    setError(null);
    try {
      await onDelete(task.id);
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  const created = new Date(task.created_at).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <div className={`task-card status-${task.status}`}>
      <div className="task-card__header">
        <h3 className="task-card__title">{task.title}</h3>
        <span className={`badge badge--${task.status}`}>{STATUS_LABELS[task.status]}</span>
      </div>

      {task.description && (
        <p className="task-card__description">{task.description}</p>
      )}

      <p className="task-card__date">Created: {created}</p>

      {error && <p className="task-card__error">{error}</p>}

      <div className="task-card__actions">
        <select
          value={task.status}
          onChange={handleStatusChange}
          disabled={updating || deleting}
          aria-label="Update status"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>

        <button
          className="btn btn-danger"
          onClick={handleDelete}
          disabled={updating || deleting}
          aria-label="Delete task"
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  );
}