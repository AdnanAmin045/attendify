"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/admin/Navbar";
import { Search, MoreVertical, Edit, Trash } from "lucide-react";
import Link from "next/link";

interface Course {
  courseinfo: string;
  department: string;
  section: string;
  semester: number;
  day: string;
  timerange: string;
  teacher_name: string;
}

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedSection, setSelectedSection] = useState("All");
  const [selectedSemester, setSelectedSemester] = useState("All");

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleToggleDropdown = (id: number) => {
    setOpenDropdownId((prevId) => (prevId === id ? null : id));
  };

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/schedule/get");
        if (!response.ok) {
          throw new Error("Failed to fetch courses.");
        }
        const data = await response.json();
        setCourses(data);
        setFilteredCourses(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  useEffect(() => {
    const results = courses.filter((course) => {
      const matchesSearch = course.courseinfo
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesDepartment =
        selectedDepartment === "All" ||
        course.department === selectedDepartment;

      const matchesSection =
        selectedSection === "All" || course.section === selectedSection;

      const matchesSemester =
        selectedSemester === "All" ||
        course.semester.toString() === selectedSemester;

      return (
        matchesSearch && matchesDepartment && matchesSection && matchesSemester
      );
    });

    setFilteredCourses(results);
  }, [searchTerm, selectedDepartment, selectedSection, selectedSemester, courses]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const departments = ["All", "Computer Science", "Software Engineering"];
  const sections = ["All", "A", "B", "C", "D"];
  const semesters = ["All", "1", "2", "3", "4", "5", "6", "7", "8"];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navbar */}
      <div className="hidden sm:block fixed h-full z-40">
        <Navbar />
      </div>

      {/* Mobile Navbar */}
      <div className="sm:hidden fixed top-4 left-4 z-50">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-0 sm:ml-20 lg:ml-64 px-4 sm:px-8 py-10">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-bold">Course Management</h1>
          <p className="text-sm text-gray-600">
            Manage course information and scheduling.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="border px-3 py-2 rounded-md text-sm focus:outline-none"
          >
            {departments.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>

          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="border px-3 py-2 rounded-md text-sm focus:outline-none"
          >
            {sections.map((sec) => (
              <option key={sec} value={sec}>
                Section {sec}
              </option>
            ))}
          </select>

          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="border px-3 py-2 rounded-md text-sm focus:outline-none"
          >
            {semesters.map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>

        {/* Search + Add */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-5 mb-8">
          <div className="relative w-full sm:w-1/2">
            <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by course info"
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          </div>

          <Link href="/admin_dashboard/schedule/new" className="w-full sm:w-auto">
            <button className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition w-full">
              Add New Schedule
            </button>
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          {loading ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              Loading courses...
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500 text-sm">{error}</div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              No records found.
            </div>
          ) : (
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="py-3 px-6 text-left">Course Info</th>
                  <th className="py-3 px-6 text-left">Department</th>
                  <th className="py-3 px-6 text-left">Section</th>
                  <th className="py-3 px-6 text-left">Semester</th>
                  <th className="py-3 px-6 text-left">Day</th>
                  <th className="py-3 px-6 text-left">Time</th>
                  <th className="py-3 px-6 text-left">Teacher</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-6">{course.courseinfo}</td>
                    <td className="py-3 px-6">{course.department}</td>
                    <td className="py-3 px-6">{course.section}</td>
                    <td className="py-3 px-6">{course.semester}</td>
                    <td className="py-3 px-6">{course.day}</td>
                    <td className="py-3 px-6">{course.timerange}</td>
                    <td className="py-3 px-6">{course.teacher_name}</td>
                    <td className="py-3 px-6 text-center relative">
                      <div ref={dropdownRef}>
                        <button
                          onClick={() => handleToggleDropdown(index)}
                          className="p-1 rounded-full hover:bg-gray-200"
                        >
                          <MoreVertical size={18} />
                        </button>
                        {openDropdownId === index && (
                          <div className="absolute right-6 mt-2 w-28 bg-white border rounded-md shadow-lg z-10">
                            <button className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-sm">
                              <Edit className="w-4 h-4 mr-2" /> Edit
                            </button>
                            <button className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-sm text-red-500">
                              <Trash className="w-4 h-4 mr-2" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
