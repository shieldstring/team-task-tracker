import { useState, useEffect, useCallback } from "react";
import * as api from "../api/task";

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const addTask = async (taskData) => {
    const newTask = await api.createTask(taskData);
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateTaskStatus = async (id, status) => {
    const updated = await api.updateTask(id, { status });
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  };

  const removeTask = async (id) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTaskStatus,
    removeTask,
    refresh: loadTasks,
  };
}
