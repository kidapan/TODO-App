import express, { Request, Response } from 'express';
import mysql from 'mysql2/promise';

const app = express();
const port = 3000;

app.use(express.json());

enum TodoStatus {
  TODO = 'TODO',
  DONE = 'DONE'
}

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
      status: TodoStatus.TODO,
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

app.put('/post/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const [result] = await pool.query<mysql.ResultSetHeader>(
      `UPDATE todos SET status = ?, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?`,
      [status, id]
    );

    res.status(200).send();
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).send({ error: 'Database error' });
  }
});

app.get('/post/search', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    let query = 'SELECT * FROM todos';
    const params: any[] = [];

    if (q) {
      query += ' WHERE (title LIKE ? OR content LIKE ?)';
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    const [result] = await pool.query<mysql.ResultSetHeader>(query, params);

    res.send({
      "todos": result
    });

  } catch (error) {
    console.error('Error searching todos:', error);
    res.status(500).send({ error: 'Database error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at port:${port}/`);
});
