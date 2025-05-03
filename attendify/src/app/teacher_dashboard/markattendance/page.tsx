"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/teacher/Navbar";
import { departments, sections, weeks } from "@/types/constant";
import toast, { Toaster } from "react-hot-toast";

interface Schedule {
  id: number;
  timerange: string;
  day: string;
}

interface Course {
  id: number;
  coursename: string;
}

interface Student {
  id: number;
  full_name: string;
  regno: string;
  image_bytea: string;
}

export default function Page() {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [courseData, setCourseData] = useState<Course[]>([]);
  const [scheduleData, setScheduleData] = useState<Schedule[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [presentStudents, setPresentStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [courseLoading, setCourseLoading] = useState(false);
  const [classtimeLoading, setclasstimeLoading] = useState(false);

  const handleDepartment = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dept = e.target.value;
    setSelectedDepartment(dept);
    setCourseLoading(true);
    try {
      const res = await fetch(`/api/markattendance/courses?department=${dept}`);
      const data = await res.json();
      setCourseData(data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setCourseLoading(false);
    }
  };

  const handleCoursesAndSection = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    type: "course" | "section"
  ) => {
    const value = e.target.value;
    if (type === "course") setSelectedCourse(value);
    if (type === "section") setSelectedSection(value);
    
    const course = type === "course" ? value : selectedCourse;
    const section = type === "section" ? value : selectedSection;
    
    
    if (course && section) {
      setclasstimeLoading(true)
      try {
        const res = await fetch(
          `/api/markattendance/classtime?course=${course}&section=${section}`
        );
        const data = await res.json();
        setScheduleData(data);
      } catch (err) {
        console.error("Error fetching class times:", err);
      }finally{
        setclasstimeLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!selectedCourse) {
      alert("Please select all fields before saving.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/markattendance/students?course=${selectedCourse}`
      );
      if (!res.ok) throw new Error("Failed to fetch students");

      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (students.length === 0) return;
    const secondApiCall = async () => {
      try {
        const res = await fetch("/api/markattendance/callpythonapi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ students }),
        });

        if (!res.ok) throw new Error("Failed to start camera");
      } catch (err) {
        console.error("Error in second API call:", err);
      }
    };

    secondApiCall();
  }, [students]);
  const handleStopDetection = async () => {
    try {
      const res = await fetch(`/api/markattendance/detectstudent`);
      if (!res.ok) throw new Error("Failed to detect student");

      const data = await res.json();
      const detectedStudents = students.filter((s) => data.ids.includes(s.id));

      if (detectedStudents.length > 0) {
        setPresentStudents((prev) => {
          const alreadyAdded = detectedStudents.filter((detectedStudent) =>
            prev.some((s) => s.id === detectedStudent.id)
          );
          return [
            ...prev,
            ...detectedStudents.filter(
              (detectedStudent) =>
                !alreadyAdded.some((s) => s.id === detectedStudent.id)
            ),
          ];
        });
      } else {
        alert("No matching students found in the registered list.");
      }
    } catch (err) {
      console.error("Error detecting student:", err);
    }
  };

  // handleClasEnd
  const handleClasEnd = async () => {
    if (!selectedClass || !presentStudents.length) {
      toast.error(
        "Please ensure all details are selected and students are marked."
      );
      return;
    }
    console.log("Selected Class: ", selectedClass);

    try {
      const data = {
        class_id: selectedClass,
        week: selectedWeek,
        students: presentStudents,
      };

      const res = await fetch("/api/markattendance/mark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Error during class end operation");
      }

      toast.success("Attendance has been marked");
    } catch (err) {
      console.error("Error during API call:", err);
      toast.error("Error marking attendance");
    }
  };

  return (
    <>
      <Navbar />
      <Toaster position="top-right" reverseOrder={false} />
      <div className="px-4 md:px-20 py-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Mark Attendance</h1>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 mb-8">
          <select
            className="h-10 rounded-md p-2 border-2"
            value={selectedDepartment}
            onChange={handleDepartment}
          >
            <option value="">Select Department</option>
            {departments.map((dep) => {
              const value = dep
                .replace(/\s+/g, "")
                .replace(/^./, (char) => char.toLowerCase());
              return (
                <option key={value} value={value}>
                  {dep}
                </option>
              );
            })}
          </select>

          <select
            className={`h-10 rounded-md p-2 border-2 ${
              courseLoading ? "bg-gray-200 cursor-not-allowed" : "bg-white"
            }`}
            value={selectedCourse}
            onChange={(e) => handleCoursesAndSection(e, "course")}
            disabled={courseLoading}
          >
            {courseLoading ? (
              <option>Loading...</option>
            ) : (
              <>
                <option value="">Select Course</option>
                {courseData.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.coursename}
                  </option>
                ))}
              </>
            )}
          </select>

          <select
            className="h-10 rounded-md p-2 border-2"
            value={selectedSection}
            onChange={(e) => handleCoursesAndSection(e, "section")}
          >
            <option value="">Select Section</option>
            {sections.map((item) => (
              <option key={item} value={item}>
                Section - {item}
              </option>
            ))}
          </select>

          {/* week  */}

          <select
            className="h-10 rounded-md p-2 border-2"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
          >
            <option value="">Select Week</option>
            {weeks.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            className={`h-10 rounded-md p-2 border-2 ${
              classtimeLoading ? "bg-gray-200 cursor-not-allowed" : "bg-white"
            }`}
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={classtimeLoading}
          >
            {classtimeLoading ? (
              <option>Loading...</option>
            ) : (
              <>
                <option value="">Select Class Time</option>
                {scheduleData.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.day} - {item.timerange}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        <div className="flex gap-4 mb-4">
          <button
            onClick={handleSave}
            className="flex-1 h-10 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Save
          </button>
          <button
            onClick={handleStopDetection}
            className="flex-1 h-10 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
          >
            Stop Detection
          </button>

          <button
            className="flex-1 h-10 rounded-md bg-green-600 hover:bg-green-700 text-white transition"
            onClick={handleClasEnd}
          >
            End Class
          </button>
        </div>

        {loading && (
          <div className="flex justify-center my-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        )}

        <div className="mt-6 grid md:grid-cols-2 gap-8">
          {/* Registered Students */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Registered Students</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded-md shadow">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 border">Full Name</th>
                    <th className="py-2 px-4 border">Registration No.</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border">{student.full_name}</td>
                      <td className="py-2 px-4 border">{student.regno}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Present Students */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Present Students</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded-md shadow">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 border">Full Name</th>
                    <th className="py-2 px-4 border">Registration No.</th>
                  </tr>
                </thead>
                <tbody>
                  {presentStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border">{student.full_name}</td>
                      <td className="py-2 px-4 border">{student.regno}</td>
                    </tr>
                  ))}
                  {presentStudents.length === 0 && (
                    <tr>
                      <td colSpan={2} className="text-center py-4">
                        No students detected yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
