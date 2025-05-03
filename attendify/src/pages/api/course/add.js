import pool from "../../../lib/db";

export default async function handler(req, res) {
    if (req.method === "POST") {
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
    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}
