import TaskCard from './TaskCard';

export default function TaskList({ tasks, onUpdateStatus, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks yet. Create one above!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onUpdateStatus={onUpdateStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}