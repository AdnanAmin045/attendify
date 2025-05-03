import pool from "../../../lib/db";
import { decryptImage } from "../encryptImage";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { course } = req.query;

    if (!course) {
      return res.status(400).json({ error: "courseid is required" });
    }

    const client = await pool.connect();

    try {
      const query = `
        SELECT students.id, students.full_name, students.regno, students.image_bytea
        FROM students
        JOIN studentcourses ON students.id = studentcourses.student_id
        WHERE studentcourses.course_id = $1
      `;
      const result = await client.query(query, [course]);

      const decryptedRows = result.rows.map(row => {
        let decryptedImage = null;
        if (row.image_bytea) {
          try {
            decryptedImage = decryptImage(row.image_bytea).toString('base64');
          } catch (err) {
            console.error(`Error decrypting image for student ${row.id}:`, err);
          }
        }
        return {
          ...row,
          image_bytea: decryptedImage, 
        };
      });
      return res.status(200).json(decryptedRows);
    } catch (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Internal server error" });
    } finally {
      client.release();
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
