import pool from "../../../lib/db";
import { verifyToken } from "../../middleware/verifytoken";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const decoded = verifyToken(req, res);
      const userId = decoded.userId;
      const { department } = req.query;
      console.log("Department:", department);
      console.log("UserId:", userId);

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
        const result = await client.query(query, [department, userId]);
        return res.status(200).json(result.rows);
      } catch (error) {
        console.error("Error fetching courses:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      } finally {
        client.release();
      }
    } catch (err) {
      console.error("Token verification failed:", err);
      return res.status(401).json({ error: "Unauthorized" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
