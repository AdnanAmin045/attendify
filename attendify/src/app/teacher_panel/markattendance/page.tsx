"use client";

import { useState, useEffect } from "react";
import Select from "react-select";
import Navbar from "@/components/teacher/Navbar";
import { departments, sections, weeks } from "../../../types/constant";
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
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [courseData, setCourseData] = useState<Course[]>([]);
  const [scheduleData, setScheduleData] = useState<Schedule[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedWeek, setSelectedWeek] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [presentStudents, setPresentStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [courseLoading, setCourseLoading] = useState(false);
  const [classtimeLoading, setClasstimeLoading] = useState(false);

  const handleDepartment = async (option: any) => {
    setSelectedDepartment(option);
    setCourseLoading(true);
    try {
      const res = await fetch(
        `/api/markattendance/courses?department=${option.value}`
      );
      const data = await res.json();
      setCourseData(data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setCourseLoading(false);
    }
  };

  

  const handleCoursesAndSection = async (
    option: any,
    type: "course" | "section"
  ) => {
    if (type === "course") setSelectedCourse(option);
    if (type === "section") setSelectedSection(option);

    const course = type === "course" ? option?.value : selectedCourse?.value;
    const section = type === "section" ? option?.value : selectedSection?.value;

    if (course && section) {
      setClasstimeLoading(true);
      try {
        const res = await fetch(
          `/api/markattendance/classtime?course=${course}&section=${section}`
        );
        const data = await res.json();
        setScheduleData(data);
      } catch (err) {
        console.error("Error fetching class times:", err);
      } finally {
        setClasstimeLoading(false);
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
        `/api/markattendance/students?course=${selectedCourse.value}`
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
      setLoading(true);
      const res = await fetch(`/api/markattendance/detectstudent`);
      if (!res.ok) throw new Error("Failed to detect student");
      const data = await res.json();
      const detectedStudents = students.filter((s) => data.ids.includes(s.id));
      if (detectedStudents.length > 0) {
        setPresentStudents((prev) => {
          const alreadyAddedIds = prev.map((s) => s.id);
          const newStudents = detectedStudents.filter(
            (s) => !alreadyAddedIds.includes(s.id)
          );
          return [...prev, ...newStudents];
        });
      } else {
        alert("No matching students found in the registered list.");
      }
    } catch (err) {
      console.error("Error detecting student:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClasEnd = async () => {
    setLoading(true);
    if (!selectedClass || !presentStudents.length) {
      toast.error(
        "Please ensure all details are selected and students are marked."
      );
      setLoading(false);
      return;
    }
    try {
      const data = {
        class_id: selectedClass.value,
        week: selectedWeek.value,
        students: presentStudents.map((student) => student.id),
      };
      console.log("Data: ", data);
      const res = await fetch("/api/markattendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error during class end operation");
      setSelectedDepartment(null);
      setSelectedCourse(null);
      setSelectedSection(null);
      setSelectedClass(null);
      setSelectedWeek(null);
      setStudents([]);
      setPresentStudents([]);
      setCourseData([]);
      setScheduleData([]);
      toast.success("Attendance has been marked");
    } catch (err) {
      console.error("Error during API call:", err);
      toast.error("Error marking attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Toaster position="top-center" reverseOrder={false} />
      <div className="px-4 md:px-20 py-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Mark Attendance</h1>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 mb-8">
          <Select
            options={departments.map((dep) => ({ value: dep, label: dep }))}
            value={selectedDepartment}
            onChange={handleDepartment}
            placeholder="Select Department"
          />
          <Select
            isLoading={courseLoading}
            options={courseData.map((course) => ({
              value: course.id,
              label: course.coursename,
            }))}
            value={selectedCourse}
            onChange={(option) => handleCoursesAndSection(option, "course")}
            placeholder="Select Course"
            isDisabled={courseLoading}
          />
          <Select
            options={sections.map((sec) => ({
              value: sec,
              label: `Section - ${sec}`,
            }))}
            value={selectedSection}
            onChange={(option) => handleCoursesAndSection(option, "section")}
            placeholder="Select Section"
          />
          <Select
            options={weeks.map((week) => ({ value: week, label: week }))}
            value={selectedWeek}
            onChange={(option) => setSelectedWeek(option)}
            placeholder="Select Week"
          />
          <Select
            isLoading={classtimeLoading}
            options={scheduleData.map((item) => ({
              value: item.id,
              label: `${item.day} - ${item.timerange}`,
            }))}
            value={selectedClass}
            onChange={(option) => setSelectedClass(option)}
            placeholder="Select Class Time"
            isDisabled={classtimeLoading}
          />
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
            onClick={handleClasEnd}
            className="flex-1 h-10 rounded-md bg-green-600 hover:bg-green-700 text-white transition"
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
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
