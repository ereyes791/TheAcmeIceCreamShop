// index.js

const express = require('express');
const { Client } = require('pg');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// PostgreSQL client setup
const client = new Client({
  user: "esteban",
  password: "123456",
  host: "localhost",
  port: 5432,
  database: "acme_flavor_db",
});

// Connect to PostgreSQL
client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Error connecting to PostgreSQL', err));

// Routes
app.get('/api/flavors', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM flavors');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching flavors', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/flavors/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM flavors WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching flavor', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/flavors', async (req, res) => {
  const { name, is_favorite } = req.body;
  try {
    const result = await client.query('INSERT INTO flavors (name, is_favorite) VALUES ($1, $2) RETURNING *', [name, is_favorite]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating flavor', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/flavors/:id', async (req, res) => {
  const { id } = req.params;
  const { name, is_favorite } = req.body;
  try {
    const result = await client.query('UPDATE flavors SET name = $1, is_favorite = $2, updated_at = NOW() WHERE id = $3 RETURNING *', [name, is_favorite, id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating flavor', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/flavors/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await client.query('DELETE FROM flavors WHERE id = $1', [id]);
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting flavor', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
