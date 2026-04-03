import { useState } from 'react';

const STATUSES = ['todo', 'in-progress', 'done'];

export default function TaskForm({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim() || undefined, status });
      setTitle(''); setDescription(''); setStatus('todo');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2>New Task</h2>
      {error && <p className="form-error">{error}</p>}
      <div className="field">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          disabled={submitting}
        />
      </div>
      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          rows={3}
          disabled={submitting}
        />
      </div>
      <div className="field">
        <label htmlFor="status">Status</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} disabled={submitting}>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add Task'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}