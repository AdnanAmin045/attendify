import pool from "../../../lib/db";
import { verifyToken } from "../../middleware/verifytoken";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const decoded = verifyToken(req, res);
      const userId = decoded.userId;

      const client = await pool.connect();
      const query = `SELECT full_name, email, department FROM teachers WHERE id = $1`;
      const result = await client.query(query, [userId]);

      client.release();

      if (result.rows.length > 0) {
        res.status(200).json(result.rows[0]);
      } else {
        res.status(404).json({ message: "Teacher not found" });
      }
    } catch (err) {
      console.error("Error fetching teacher details:", err);
      res.status(500).json({ message: "Server error" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
