import pool from '@/lib/db';

export default async function handler(req, res) {
    if (req.method === "GET") {
        console.log("hello")
        try {
            const { department, semester } = req.query;

            if (!department || !semester) {
                return res.status(400).json({ error: "Missing department or semester in query." });
            }

            const client = await pool.connect();

            try {
                const query = `SELECT id, courseid, coursename FROM courses WHERE department = $1 AND semester = $2`;
                const result = await client.query(query, [department, semester]);

                const data = result.rows.map((row) => ({
                    id: row.id,
                    name: `${row.courseid} ${row.coursename}`
                }));
                res.status(200).json(data);
            } finally {
                client.release();
            }

        } catch (error) {
            console.error("Database query error:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
