import express, { Request, Response } from 'express';
import mysql from 'mysql2/promise';

const app = express();
const port = 3000;

app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.get('/post', async (req: Request, res: Response) => {
  const [result] = await pool.query(
    `SELECT * FROM todos`
  );

  res.send({
    "todos": result
  })
});

app.post('/post', async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    const now = new Date();

    const [result] = await pool.query<mysql.ResultSetHeader>(
      `INSERT INTO todos (title, content, updated_at)
       VALUES (?, ?, CURRENT_TIMESTAMP(3))`,
      [title, content]
    );

    const todo = {
      id: result.insertId,
      title,
      content,
      status: 'TODO' as const,
      created_at: now,
      updated_at: now
    };

    res.status(201).send({ "todo": todo });
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).send({ error: 'Database error' });
  }
});

app.delete('/post/:id', async (req: Request, res: Response) => {
  const todoId = req.params.id;
  const [result] = await pool.query(
    'DELETE FROM todos WHERE id = ?',
    [todoId]
  );

  res.status(200).send()
});

app.get('/', async (req: Request, res: Response) => {
  res.status(200).send()
});

app.listen(port, () => {
  console.log(`Server running at port:${port}/`);
});

enum TodoStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

app.put('/post/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    if (!Object.values(TodoStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const [result] = await pool.query<mysql.ResultSetHeader>(
      `UPDATE todos SET status = ?, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});



