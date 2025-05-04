import pool from "../../../lib/db";
import { verifyToken } from "../../middleware/verifytoken";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const decoded = verifyToken(req, res);
      try {
        const client = await pool.connect();
        await client.query("BEGIN");

        const query = `
        SELECT 
          courses.courseid,
          courses.coursename,
          courses.department,
          teachers.full_name AS teachername,
          courses.semester,
          courses.credithours
          FROM courses
        JOIN teachers ON courses.assignedteacher = teachers.id
      `;
        const result = await client.query(query);

        await client.query("COMMIT");
        client.release();
        console.log("Data: ", result.rows)
        res.status(200).json(result.rows);
      } catch (err) {
        console.error("error: ", err);
        res.status(500).json({ message: "Internal Server Error" });
      }
    } catch (err) {
      console.error("Token verification failed:", err);
      return res.status(401).json({ error: "Unauthorized" });
    }
  } else {
    res.status(400).json({ message: "Wrong Request" });
  }
}
