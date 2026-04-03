process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
chai.use(chaiHttp);

let taskStore = [];
let nextId = 1;

const dbStub = {
  query: async (text, params = []) => {
    const sql = text.replace(/\s+/g, ' ').trim().toUpperCase();

    // SELECT *
    if (sql.startsWith('SELECT * FROM TASKS ORDER BY')) {
      return { rows: [...taskStore].reverse(), rowCount: taskStore.length };
    }
    if (sql.startsWith('SELECT * FROM TASKS WHERE ID')) {
      const id = Number(params[0]);
      const rows = taskStore.filter((t) => t.id === id);
      return { rows, rowCount: rows.length };
    }
    // INSERT
    if (sql.startsWith('INSERT INTO TASKS')) {
      const [title, description, status] = params;
      const task = {
        id: nextId++,
        title,
        description: description || null,
        status,
        created_at: new Date().toISOString(),
      };
      taskStore.push(task);
      return { rows: [task], rowCount: 1 };
    }
    // UPDATE
    if (sql.startsWith('UPDATE TASKS')) {
      const [title, description, status, id] = params;
      const idx = taskStore.findIndex((t) => t.id === Number(id));
      if (idx === -1) return { rows: [], rowCount: 0 };
      taskStore[idx] = { ...taskStore[idx], title, description, status };
      return { rows: [taskStore[idx]], rowCount: 1 };
    }
    // DELETE
    if (sql.startsWith('DELETE FROM TASKS WHERE ID')) {
      const id = Number(params[0]);
      const before = taskStore.length;
      taskStore = taskStore.filter((t) => t.id !== id);
      return { rows: [], rowCount: before - taskStore.length };
    }
    // CREATE TABLE (initDb)
    if (sql.startsWith('CREATE TABLE IF NOT EXISTS')) {
      return { rows: [], rowCount: 0 };
    }
    return { rows: [], rowCount: 0 };
  },
  pool: { on: () => {} },
  initDb: async () => {},
};

// Inject stub before loading app
const Module = require('module');
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (
    parent &&
    parent.filename &&
    parent.filename.includes('team-task-tracker') &&
    (request === '../db' || request === './db' || request.endsWith('/db'))
  ) {
    return dbStub;
  }
  return originalLoad.apply(this, arguments);
};

const app = require('../backend/src/app');

// ─── helpers 
const createTask = (data) =>
  chai.request(app).post('/tasks').send(data);

// ─── reset store before each test
beforeEach(() => {
  taskStore = [];
  nextId = 1;
});


describe('Task API', () => {

  // ── POST /tasks 
  describe('POST /tasks – create a task', () => {
    it('creates a task with title only and returns 201', async () => {
      const res = await createTask({ title: 'Write unit tests' });
      expect(res).to.have.status(201);
      expect(res.body).to.include({ title: 'Write unit tests', status: 'todo' });
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('created_at');
    });

    it('creates a task with all fields', async () => {
      const payload = {
        title: 'Deploy to production',
        description: 'Push latest build',
        status: 'in-progress',
      };
      const res = await createTask(payload);
      expect(res).to.have.status(201);
      expect(res.body).to.include(payload);
    });

    it('returns 400 when title is missing', async () => {
      const res = await createTask({ description: 'No title here' });
      expect(res).to.have.status(400);
      expect(res.body).to.have.property('error');
    });

    it('returns 400 when title is an empty string', async () => {
      const res = await createTask({ title: '   ' });
      expect(res).to.have.status(400);
    });

    it('returns 400 for an invalid status value', async () => {
      const res = await createTask({ title: 'Bad status', status: 'pending' });
      expect(res).to.have.status(400);
    });
  });

  // ── GET /tasks 
  describe('GET /tasks – fetch all tasks', () => {
    it('returns an empty array when no tasks exist', async () => {
      const res = await chai.request(app).get('/tasks');
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array').with.lengthOf(0);
    });

    it('returns all created tasks', async () => {
      await createTask({ title: 'Task A' });
      await createTask({ title: 'Task B' });
      const res = await chai.request(app).get('/tasks');
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array').with.lengthOf(2);
    });

    it('each task has the expected fields', async () => {
      await createTask({ title: 'Check fields' });
      const res = await chai.request(app).get('/tasks');
      const task = res.body[0];
      expect(task).to.have.all.keys('id', 'title', 'description', 'status', 'created_at');
    });
  });

  // ── GET /tasks/:id 
  describe('GET /tasks/:id – fetch single task', () => {
    it('returns the correct task by ID', async () => {
      const created = await createTask({ title: 'Find me' });
      const id = created.body.id;
      const res = await chai.request(app).get(`/tasks/${id}`);
      expect(res).to.have.status(200);
      expect(res.body.title).to.equal('Find me');
    });

    it('returns 404 for a non-existent ID', async () => {
      const res = await chai.request(app).get('/tasks/9999');
      expect(res).to.have.status(404);
    });

    it('returns 400 for a non-numeric ID', async () => {
      const res = await chai.request(app).get('/tasks/abc');
      expect(res).to.have.status(400);
    });
  });

  // ── PUT /tasks/:id
  describe('PUT /tasks/:id – update task', () => {
    it('updates the status of an existing task', async () => {
      const created = await createTask({ title: 'Status update test' });
      const id = created.body.id;
      const res = await chai
        .request(app)
        .put(`/tasks/${id}`)
        .send({ status: 'in-progress' });
      expect(res).to.have.status(200);
      expect(res.body.status).to.equal('in-progress');
    });

    it('updates the title of an existing task', async () => {
      const created = await createTask({ title: 'Old title' });
      const id = created.body.id;
      const res = await chai
        .request(app)
        .put(`/tasks/${id}`)
        .send({ title: 'New title' });
      expect(res).to.have.status(200);
      expect(res.body.title).to.equal('New title');
    });

    it('marks a task as done', async () => {
      const created = await createTask({ title: 'Finish me' });
      const id = created.body.id;
      const res = await chai
        .request(app)
        .put(`/tasks/${id}`)
        .send({ status: 'done' });
      expect(res).to.have.status(200);
      expect(res.body.status).to.equal('done');
    });

    it('returns 400 for an invalid status', async () => {
      const created = await createTask({ title: 'Bad status task' });
      const id = created.body.id;
      const res = await chai
        .request(app)
        .put(`/tasks/${id}`)
        .send({ status: 'unknown' });
      expect(res).to.have.status(400);
    });

    it('returns 404 for a non-existent task', async () => {
      const res = await chai
        .request(app)
        .put('/tasks/9999')
        .send({ status: 'done' });
      expect(res).to.have.status(404);
    });
  });

  // ── DELETE /tasks/:id 
  describe('DELETE /tasks/:id – delete task', () => {
    it('deletes an existing task and returns 204', async () => {
      const created = await createTask({ title: 'Delete me' });
      const id = created.body.id;
      const res = await chai.request(app).delete(`/tasks/${id}`);
      expect(res).to.have.status(204);
    });

    it('task is no longer in the list after deletion', async () => {
      const created = await createTask({ title: 'Gone soon' });
      const id = created.body.id;
      await chai.request(app).delete(`/tasks/${id}`);
      const listRes = await chai.request(app).get('/tasks');
      const ids = listRes.body.map((t) => t.id);
      expect(ids).not.to.include(id);
    });

    it('returns 404 when deleting a non-existent task', async () => {
      const res = await chai.request(app).delete('/tasks/9999');
      expect(res).to.have.status(404);
    });
  });

  // ── /health 
  describe('GET /health', () => {
    it('returns 200 with status ok', async () => {
      const res = await chai.request(app).get('/health');
      expect(res).to.have.status(200);
      expect(res.body.status).to.equal('ok');
    });
  });
});