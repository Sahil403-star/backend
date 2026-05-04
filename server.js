const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors({
  origin: "*"
}));

app.use(express.json());
// ─── In-Memory Store ──────────────────────────────────────────────────────────
const users = [
  { id: 'u1', name: 'Alice Admin', email: 'admin@demo.com', password: 'admin123', role: 'admin' },
  { id: 'u2', name: 'Bob Member', email: 'member@demo.com', password: 'member123', role: 'member' },
];

const tasks = [
  {
    id: 't1',
    title: 'Design landing page',
    description: 'Create wireframes and final design for the new marketing landing page.',
    assignedTo: 'u2',
    status: 'in-progress',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // overdue
    createdBy: 'u1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 't2',
    title: 'Write API documentation',
    description: 'Document all REST endpoints with request/response examples.',
    assignedTo: 'u2',
    status: 'pending',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdBy: 'u1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 't3',
    title: 'Deploy to Railway',
    description: 'Set up Railway project and configure environment variables.',
    assignedTo: 'u1',
    status: 'done',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdBy: 'u1',
    createdAt: new Date().toISOString(),
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function validate(fields, body) {
  for (const f of fields) {
    if (!body[f] || String(body[f]).trim() === '') {
      return `Field "${f}" is required.`;
    }
  }
  return null;
}

// ─── Auth Routes ──────────────────────────────────────────────────────────────
app.post('/signup', (req, res) => {
  const { name, email, password, role } = req.body;
  const err = validate(['name', 'email', 'password'], req.body);
  if (err) return res.status(400).json({ error: err });

  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'Email already registered.' });
  }

  const user = {
    id: uuidv4(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    role: role === 'admin' ? 'admin' : 'member',
  };
  users.push(user);

  const { password: _, ...safe } = user;
  res.status(201).json({ user: safe });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const err = validate(['email', 'password'], req.body);
  if (err) return res.status(400).json({ error: err });

  const user = users.find(
    u => u.email === email.trim().toLowerCase() && u.password === password
  );
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

  const { password: _, ...safe } = user;
  res.json({ user: safe });
});

// ─── Task Routes ──────────────────────────────────────────────────────────────
app.get('/tasks', (req, res) => {
  const { userId, role } = req.query;

  let result = tasks;

  // If not admin, filter by userId
  if (role !== 'admin') {
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }
    result = tasks.filter(t => t.assignedTo === userId);
  }

  const enriched = result.map(t => ({
    ...t,
    assigneeName: users.find(u => u.id === t.assignedTo)?.name || 'Unassigned',
  }));

  res.json(enriched);
});

app.post('/tasks', (req, res) => {
  const { title, description, assignedTo, dueDate, createdBy, role } = req.body;

  if (role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can create tasks.' });
  }

  const err = validate(['title', 'assignedTo', 'createdBy'], req.body);
  if (err) return res.status(400).json({ error: err });

  if (!users.find(u => u.id === assignedTo)) {
    return res.status(400).json({ error: 'Assigned user does not exist.' });
  }

  const task = {
    id: uuidv4(),
    title: title.trim(),
    description: description?.trim() || '',
    assignedTo,
    status: 'pending',
    dueDate: dueDate || null,
    createdBy,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);

  res.status(201).json({
    ...task,
    assigneeName: users.find(u => u.id === assignedTo)?.name || 'Unassigned',
  });
});

app.put('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found.' });

  const { status, userId, role } = req.body;

  // Members can only update their own tasks
  if (role !== 'admin' && task.assignedTo !== userId) {
    return res.status(403).json({ error: 'You can only update tasks assigned to you.' });
  }

  const allowed = ['pending', 'in-progress', 'done'];
  if (status && !allowed.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
  }

  if (status) task.status = status;

  // Admins can also update other fields
  if (role === 'admin') {
    if (req.body.title) task.title = req.body.title.trim();
    if (req.body.description !== undefined) task.description = req.body.description.trim();
    if (req.body.assignedTo) task.assignedTo = req.body.assignedTo;
    if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate;
  }

  res.json({
    ...task,
    assigneeName: users.find(u => u.id === task.assignedTo)?.name || 'Unassigned',
  });
});

// Expose user list (admin use — for assigning tasks)
app.get('/users', (req, res) => {
  res.json(users.map(({ password: _, ...u }) => u));
});

app.get("/", (req, res) => {
  res.json({ message: "Backend is running 🚀" });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
