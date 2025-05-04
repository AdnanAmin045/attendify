import pool from "../../../lib/db";
import { verifyToken } from "../../middleware/verifytoken";

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const decoded = verifyToken(req, res);
            const client = await pool.connect();
            try {
                const { class_id, week, students } = req.body;

                await client.query('BEGIN');

                const query = `
                 INSERT INTO classAttendence (class_id, week, students) 
                VALUES ($1, $2, $3)
            `;

                await client.query(query, [class_id, week, students]);

                await client.query('COMMIT');

                res.status(200).json({ message: 'Attendance recorded successfully' });
            } catch (error) {
                await client.query('ROLLBACK');
                console.error(error);
                res.status(500).json({ message: 'Error recording attendance' });
            } finally {
                client.release();
            }
        } catch (err) {
            console.error("Token verification failed:", err);
            return res.status(401).json({ error: "Unauthorized" });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
