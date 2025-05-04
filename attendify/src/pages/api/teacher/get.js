import pool from "../../../lib/db";
import { AES, enc } from "crypto-js";
import { verifyToken } from "../../middleware/verifytoken";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const decoded = verifyToken(req, res);
      try {
        const client = await pool.connect();
        await pool.query("BEGIN");

        const query = `SELECT * FROM teachers`;
        const result = await pool.query(query);

        await pool.query("COMMIT");
        client.release();

        const decryptedData = result.rows.map((teacher) => {
          return {
            ...teacher,
            password: AES.decrypt(teacher.password, process.env.AES_SECRET_KEY).toString(enc.Utf8),
          };
        });

        res.status(200).json(decryptedData);
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
