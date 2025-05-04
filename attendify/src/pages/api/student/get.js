import pool from "../../../lib/db";
import { verifyToken } from "../../middleware/verifytoken";
export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const decoded = verifyToken(req, res);
      const client = await pool.connect();
      try {
        const result = await client.query(`
        SELECT regno, full_name, department, section, email, phone, image_url 
        FROM students
      `);

        const students = result.rows.map(student => ({
          regNo: student.regno,
          name: student.full_name,
          department: student.department,
          section: student.section,
          email: student.email,
          phone: student.phone,
          image_url: student.image_url
        }));

        res.status(200).json(students);
      } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Error fetching student data" });
      } finally {
        client.release();
      }
    } catch (err) {
      console.error("Token verification failed:", err);
      return res.status(401).json({ error: "Unauthorized" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}