import pool from '@/lib/db';
import { verifyToken } from '../../middleware/verifytoken';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const decoded = verifyToken(req, res);
            try {
                const client = await pool.connect();

                const query = `
                        SELECT 
                            courses.courseid || '  ' || courses.coursename AS courseinfo,
                            courses.department,
                            courses.semester,
                            scheduleclass.section,
                            scheduleclass.day,
                            scheduleclass.timerange,
                            teachers.full_name AS teacher_name
                            FROM 
                            scheduleclass
                        JOIN 
                            courses ON scheduleclass.course_id = courses.id
                        JOIN 
                            teachers ON courses.assignedteacher = teachers.id
                            `;
                const result = await client.query(query);
                client.release();
                res.status(200).json(result.rows);
            } catch (error) {
                console.error('Error fetching data:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        } catch (err) {
            console.error("Token verification failed:", err);
            return res.status(401).json({ error: "Unauthorized" });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
