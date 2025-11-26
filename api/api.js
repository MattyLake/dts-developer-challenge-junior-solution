const express = require('express');
const cors = require('cors');
const knex = require('knex')(require('./knexfile'));
const sanitizeHtml = require('sanitize-html');

const app = express();
const port = 3000;

app.use(cors({
    origin: [
      'http://localhost:9000', //Development
      'http://localhost:8080'  //Production
    ]
}));
app.use(express.json());

// Helpers
const ALLOWED_STATUS = ['To Do', 'In Progress', 'Done'];
function toDueAt(dueDate, time) {
  if (!dueDate || !time) return null;
  const iso = `${dueDate}T${time}`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function cleanInput(str, max = 255) {
  if (typeof str !== 'string') return '';
  let out = sanitizeHtml(str, { allowedTags: [], allowedAttributes: {} }).trim();
  if (out.length > max) out = out.slice(0, max);
  // Collapse excessive internal whitespace
  out = out.replace(/\s+/g, ' ');
  return out;
}

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the API!' });
});

// Create task endpoint
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, status = 'To Do', dueDate, time } = req.body || {};

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const dueAtISO = toDueAt(dueDate, time);
    if (!dueAtISO) {
      return res.status(400).json({ error: 'Invalid due date/time' });
    }
    if (new Date(dueAtISO) <= new Date()) {
      return res.status(400).json({ error: 'Due date/time must be in the future' });
    }

    const cleanedTitle = cleanInput(title, 255);
    if (!cleanedTitle) {
      return res.status(400).json({ error: 'Title is required after cleaning' });
    }
    const cleanedDescription = description ? cleanInput(description, 2000) : null;

    const [task] = await knex('tasks')
      .insert({
        title: cleanedTitle,
        description: cleanedDescription,
        status,
        due_date: dueDate,
        due_time: time,
      })
      .returning(['id', 'title', 'description', 'status', 'due_date', 'due_time', 'time_created']);

    return res.status(201).json({ task });
  } catch (err) {
    console.error('Create task failed:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log('Serving the frontend from the "public" directory.');
});