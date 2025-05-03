// lib/db.js

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});


pool.connect()
  .then((client) => {
    console.log("✅ PostgreSQL connected successfully!");
    client.release(); 
  })
  .catch((err) => {
    console.error("❌ PostgreSQL connection error:", err.stack);
  });

export default pool;
