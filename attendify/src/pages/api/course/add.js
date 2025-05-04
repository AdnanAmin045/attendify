import pool from "../../../lib/db";
import { verifyToken } from "../../middleware/verifytoken";

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const decoded = verifyToken(req, res);

            const { courseId, courseName, assignedTeacher, department, semester, creditHours } = req.body;
            if (!courseId || !courseName || !assignedTeacher || !department || !semester || !creditHours) {
                return res.status(400).json({ message: "All fields are required." });
            }
            try {
                await pool.query("BEGIN");
                const insertCourseQuery = `
        INSERT INTO courses (courseid, coursename, assignedteacher, department, semester, credithours)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;

                await pool.query(insertCourseQuery, [
                    courseId,
                    courseName,
                    assignedTeacher,
                    department,
                    semester,
                    creditHours,
                ]);

                await pool.query("COMMIT");

                return res.status(201).json({ message: "Course added successfully" });
            } catch (error) {
                await pool.query("ROLLBACK");
                console.error(error);
                return res.status(500).json({ message: "Internal server error", error: error.message });
            }
        } catch (err) {
            console.error("Token verification failed:", err);
            return res.status(401).json({ error: "Unauthorized" });
        }
    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}
