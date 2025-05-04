import pool from "../../../lib/db";
import { verifyToken } from "../../middleware/verifytoken";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const decoded = verifyToken(req, res);
      const { course, section } = req.query;

      if (!course || !section) {
        return res.status(400).json({ error: "course_id and section are required" });
      }

      const client = await pool.connect();
      try {
        const query = `
          SELECT id, day, timerange
          FROM scheduleclass
        WHERE course_id = $1 AND section = $2
      `;
        const result = await client.query(query, [course, section]);
        res.status(200).json(result.rows);
      } catch (error) {
        console.error("Error fetching schedule:", error);
        res.status(500).json({ error: "Internal Server Error" });
      } finally {
        client.release();
      }
    } catch (err) {
      console.error("Token verification failed:", err);
      return res.status(401).json({ error: "Unauthorized" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
