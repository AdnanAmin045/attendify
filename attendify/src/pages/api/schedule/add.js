import pool from '@/lib/db'; // Your PostgreSQL connection pool

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { course_Id, day,section, timeRange } = req.body;
      console.log("CourseId: ",course_Id)

      if (!course_Id || !day || !timeRange) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const query = `
        INSERT INTO scheduleclass (course_id,section, day, timerange)
        VALUES ($1, $2, $3,$4);
      `;
      const values = [course_Id,section, day, timeRange];
      await client.query(query, values);

      await client.query('COMMIT');
      res.status(201).json({message:"Class has been scheduled"});
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to save schedule' });
    } finally {
      client.release();
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
