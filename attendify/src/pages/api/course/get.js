import pool from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
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
      console.log("Data: ",result.rows)
      res.status(200).json(result.rows);
    } catch (err) {
      console.error("error: ", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.status(400).json({ message: "Wrong Request" });
  }
}
