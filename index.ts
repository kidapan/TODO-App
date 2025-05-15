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






// テストtest

