const BASE_URL = process.env.REACT_APP_API_URL || '/tasks';

const handleResponse = async (res) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

export const fetchTasks = () =>
  fetch(BASE_URL).then(handleResponse);

export const createTask = (data) =>
  fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);

export const updateTask = (id, data) =>
  fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteTask = (id) =>
  fetch(`${BASE_URL}/${id}`, { method: 'DELETE' }).then(handleResponse);