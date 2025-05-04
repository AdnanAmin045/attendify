import pool from "../../../lib/db";
import { verifyToken } from "../../middleware/verifytoken";

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            const decoded = verifyToken(req);
            const userId = decoded.userId;
            const client = await pool.connect();
            const query = `
                SELECT 
                    c.department,
                    json_agg(
                        json_build_object(
                            'id', c.id,
                            'courseid', c.courseid,
                            'courseName', c.courseName,
                            'students', COALESCE(sc.students, '[]')
                        )
                    ) AS courses
                FROM courses c
                LEFT JOIN (
                    SELECT 
                        sc.course_id,
                        json_agg(
                            json_build_object(
                                'id', s.id,
                                'full_name', s.full_name,
                                'regno', s.regno,
                                'section', s.section,
                                'phone', s.phone,
                                'email', s.email
                            )
                        ) AS students
                    FROM studentcourses sc
                    JOIN students s ON sc.student_id = s.id
                    GROUP BY sc.course_id
                ) sc ON c.id = sc.course_id
                WHERE c.assignedteacher = $1
                GROUP BY c.department
            `;
            const values = [userId];
            const result = await client.query(query, values);
            client.release();
            res.status(200).json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(401).json({ error: err.message });
        }
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}
