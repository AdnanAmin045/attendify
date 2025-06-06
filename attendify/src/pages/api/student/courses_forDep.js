import pool from '@/lib/db';
import { verifyToken } from '../../middleware/verifytoken';
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    try {
        const decoded = verifyToken(req, res);
        const { department } = req.query;

        if (!department || typeof department !== 'string') {
            return res.status(400).json({ message: 'Missing or invalid query parameters' });
        }
        try {
            const result = await pool.query(
                'SELECT id,courseid,coursename FROM courses WHERE department = $1',
                [department]
            );
            const courseNames = result.rows.map((row) => ({
                id: row.id,
                name: `${row.courseid} ${row.coursename}`
            })); console.log("Data: ", courseNames)
            res.status(200).json(courseNames);
        } catch (error) {
            console.error('Error fetching courses:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } catch (err) {
        console.error("Token verification failed:", err);
        return res.status(401).json({ error: "Unauthorized" });
    }
}
