import pool from "../../../lib/db";
import { encryptImage } from "../encryptImage";
import { verifyToken } from "../../middleware/verifytoken";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const decoded = verifyToken(req, res);
      const { regNo, name, department, section, email, phone, courses, image_url, image_bytea } = req.body;
      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        const imageBuffer = Buffer.from(image_bytea.split(",")[1], 'base64');

        const { encryptedData: encryptedImage } = encryptImage(imageBuffer);


        const studentInsertQuery = `
        INSERT INTO students (regno, full_name, department, section, email, phone, image_url, image_bytea)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `;
        const studentValues = [
          regNo,
          name,
          department,
          section,
          email,
          phone,
          image_url,
          encryptedImage
        ];

        const studentResult = await client.query(studentInsertQuery, studentValues);

        const studentId = studentResult.rows[0].id;
        for (const courseId of courses) {
          const courseInsertQuery = `
          INSERT INTO studentcourses (student_id, course_id)
          VALUES ($1, $2)
        `;
          await client.query(courseInsertQuery, [studentId, courseId]);
        }

        await client.query("COMMIT");
        res.status(200).json({ message: "Student added successfully!" });
      } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error submitting form", error);
        res.status(500).json({ message: "Error submitting form" });
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
