import pool from "../../../lib/db";


export default async function handler(req,res) {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  
    const { department } = req.query;
    console.log("Department: ",department)
    if (!department || typeof department !== 'string') {
      return res.status(400).json({ error: 'Invalid department' });
    }
  
    const client = await pool.connect();
  
    try {
      await client.query('BEGIN'); 
  
      const result = await client.query(
        'SELECT id, full_name, department FROM teachers WHERE department = $1',
        [department]
      );
  
      await client.query('COMMIT');
  
      const teachers = result.rows.map((teacher) => ({
        id: teacher.id,
        full_name: teacher.full_name,
        department: teacher.department,
      }));
  
      return res.status(200).json(teachers);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction error:', error);
      return res.status(500).json({ error: 'Failed to fetch teachers' });
    } finally {
      client.release(); 
    }
  }