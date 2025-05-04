import pool from '@/lib/db';
import { verifyToken } from '../../middleware/verifytoken';

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            const decoded = verifyToken(req, res);
            try {
                const { department, semester } = req.query;

                if (!department || !semester) {
                    return res.status(400).json({ error: "Missing department or semester in query." });
                }

                const client = await pool.connect();

                try {
                    const query = `SELECT id, courseid, coursename FROM courses WHERE department = $1 AND semester = $2`;
                    const result = await client.query(query, [department, semester]);

                    const data = result.rows.map((row) => ({
                        id: row.id,
                        name: `${row.courseid} ${row.coursename}`
                    }));
                    res.status(200).json(data);
                } finally {
                    client.release();
                }

            } catch (error) {
                console.error("Database query error:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        } catch (err) {
            console.error("Token verification failed:", err);
            return res.status(401).json({ error: "Unauthorized" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
