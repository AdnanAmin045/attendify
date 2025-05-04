import pool from "../../../lib/db";
import { AES } from "crypto-js";
import { verifyToken } from "../../middleware/verifytoken";

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const decoded = verifyToken(req, res);
            const client = await pool.connect();
            console.log("Data: ", req.body)
            try {
                const { employeeid, full_name, department, email } = req.body;

                if (!employeeid || !full_name || !department || !email) {
                    console.log("❌ Missing fields");
                    return res.status(400).json({ error: "All fields are required" });
                }

                const generatePassword = () => {
                    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!';
                    let password = '';
                    for (let i = 0; i < 8; i++) {
                        password += chars.charAt(Math.floor(Math.random() * chars.length));
                    }
                    return password;
                };
                const plainPassword = generatePassword();

                const secretKey = process.env.AES_SECRET_KEY || "default_key";

                const encryptedPassword = AES.encrypt(plainPassword, secretKey).toString();

                await client.query("BEGIN");
                const insertQuery = `
                INSERT INTO teachers(employeeid, full_name, department, email, password)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *;
            `;
                const values = [employeeid, full_name, department, email, encryptedPassword];

                await client.query(insertQuery, values);

                await client.query("COMMIT");

                return res.status(201).json({
                    message: "Teacher created successfully",
                });

            } catch (error) {
                await client.query("ROLLBACK");
                console.error("❌ Internal Server Error:", error);
                return res.status(500).json({ error: "Internal Server Error" });
            } finally {
                client.release();
            }
        } catch (err) {
            console.error("Token verification failed:", err);
            return res.status(401).json({ error: "Unauthorized" });
        }
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}
