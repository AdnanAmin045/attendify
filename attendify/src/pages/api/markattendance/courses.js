import pool from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { department } = req.query;

    if (!department) {
      return res.status(400).json({ error: "Department is required" });
    }

    const client = await pool.connect();
    try {
      const query = `
        SELECT courses.id,
               courses.courseid || ' - ' || courses.coursename AS courseName
        FROM teachers
        JOIN courses ON teachers.id = courses.assignedteacher
        WHERE courses.department = $1 AND teachers.id = $2
      `;
      const result = await client.query(query, [department, 1]);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      client.release();
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
