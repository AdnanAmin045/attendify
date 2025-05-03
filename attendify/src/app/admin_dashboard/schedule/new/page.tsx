"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "@/components/admin/Navbar";
import { departments, semesters, days, sections } from "@/types/constant"; // Added sections to constants

interface Course {
  id: number;
  name: string;
}

const SchedulePage = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedDay, setSelectedDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      if (selectedDepartment && selectedSemester) {
        setIsLoadingCourses(true);
        setAvailableCourses([]);
        setSelectedCourse(null);

        try {
          const res = await fetch(
            `/api/schedule/courses?department=${selectedDepartment}&semester=${selectedSemester}`
          );
          
          if (!res.ok) throw new Error("Failed to fetch courses");
          
          const data = await res.json();
          setAvailableCourses(data);
        } catch (err) {
          toast.error("Failed to fetch courses");
          console.error(err);
        } finally {
          setIsLoadingCourses(false);
        }
      }
    };

    const timer = setTimeout(() => {
      fetchCourses();
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedDepartment, selectedSemester]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (
      !selectedDepartment ||
      !selectedSemester ||
      !selectedCourse ||
      !selectedDay ||
      !startTime ||
      !endTime ||
      !selectedSection // Added section validation
    ) {
      toast.error("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    if (startTime >= endTime) {
      toast.error("End time must be after start time");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/schedule/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_Id: selectedCourse.id,
          day: selectedDay,
          timeRange: `${startTime}-${endTime}`,
          section: selectedSection,
        }),
      });

      if (!response.ok) throw new Error("Failed to save schedule");

      toast.success("Schedule added successfully!");
      
      // Reset form
      setSelectedDepartment("");
      setSelectedSemester("");
      setAvailableCourses([]);
      setSelectedCourse(null);
      setSelectedDay("");
      setStartTime("");
      setEndTime("");
      setSelectedSection(""); // Reset section
    } catch (err) {
      toast.error("Failed to save schedule");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <div className="hidden sm:block fixed h-full z-40">
        <Navbar />
      </div>

      <div className="flex-1 overflow-auto ml-0 sm:ml-20 lg:ml-64 px-6 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin_dashboard/schedule"
            className="bg-gray-200 hover:bg-gray-300 p-3 rounded-xl"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold">Add Class Schedule</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-xl p-8 rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department */}
            <div className="flex flex-col">
              <label className="font-semibold mb-2">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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
            </div>

            {/* Semester */}
            <div className="flex flex-col">
              <label className="font-semibold mb-2">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!selectedDepartment}
              >
                <option value="">Select Semester</option>
                {semesters.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </div>

            {/* Courses */}
            {selectedDepartment && selectedSemester && (
              <div className="flex flex-col">
                <label className="font-semibold mb-2">Course</label>
                {isLoadingCourses ? (
                  <div className="border rounded-lg p-2 bg-gray-100 text-gray-500">
                    Loading courses...
                  </div>
                ) : (
                  <select
                    value={selectedCourse?.id || ""}
                    onChange={(e) => {
                      const courseId = Number(e.target.value);
                      const course = availableCourses.find(c => c.id === courseId) || null;
                      setSelectedCourse(course);
                    }}
                    className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isLoadingCourses || availableCourses.length === 0}
                  >
                    <option value="">
                      {availableCourses.length === 0
                        ? "No courses available"
                        : "Select Course"}
                    </option>
                    {availableCourses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Section - New Field */}
            <div className="flex flex-col">
              <label className="font-semibold mb-2">Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!selectedCourse}
              >
                <option value="">Select Section</option>
                {sections.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>

            {/* Day */}
            <div className="flex flex-col">
              <label className="font-semibold mb-2">Day</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!selectedSection} // Changed to depend on section selection
              >
                <option value="">Select Day</option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Time */}
            <div className="flex flex-col">
              <label className="font-semibold mb-2">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!selectedDay}
              />
            </div>

            {/* End Time */}
            <div className="flex flex-col">
              <label className="font-semibold mb-2">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!startTime}
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full mt-8 py-3 px-6 text-white font-medium rounded-lg flex justify-center items-center gap-2 ${
              isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              "Add Schedule"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SchedulePage;