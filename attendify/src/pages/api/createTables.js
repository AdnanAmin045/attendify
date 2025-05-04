// pages/api/createTables.js

import pool from "../../lib/db";


const changeName = `ALTER TABLE teacher RENAME TO teachers;`
const delColumn = `ALTER TABLE courses
ALTER COLUMN semester TYPE VARCHAR(10);

`
const dropTable = `DROP TABLE courses`

const teacher = `CREATE TABLE IF NOT EXISTS teachers (
    id SERIAL PRIMARY KEY,
    employeeId VARCHAR(100) UNIQUE,
    full_name TEXT NOT NULL,
    department VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password TEXT NOT NULL
);`

const courses = `CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  courseId VARCHAR(100) UNIQUE,
  courseName VARCHAR(255) NOT NULL,
  assignedTeacher INT,
  department VARCHAR(255) NOT NULL,
  semester INT NOT NULL,
  credithours INT NOT NULL,
  FOREIGN KEY (assignedTeacher) REFERENCES teachers(id)
);`


const students = `CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    regno VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    section VARCHAR(10) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    image_url TEXT NOT NULL,
    image_bytea BYTEA NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`

const studentCourses = `CREATE TABLE studentcourses (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);`

const scheduleclass = `CREATE TABLE scheduleclass (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL,
    section VARCHAR(10) NOT NULL,
    day VARCHAR(100) NOT NULL,
    timerange VARCHAR(255) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);`

const attendence = `CREATE TABLE classAttendence (
    id SERIAL PRIMARY KEY,                  
    class_id INT REFERENCES scheduleclass(id),    
    week VARCHAR(20),                       
    students INT[],                         
    date DATE DEFAULT CURRENT_DATE
);`



export default async function handler(req, res) {
  try {
    const query = attendence;

    // Execute the query
    await pool.query(query);
    console.log("✅ Teachers table created successfully (or already exists).");

    // Respond to the client
    res.status(200).json({ success: true, message: "✅ Teachers table created successfully!" });
  } catch (error) {
    console.error("❌ Error creating teachers table:", error);
    res.status(500).json({ success: false, message: "❌ Failed to create table", error: error.message });
  }
}
