"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/admin/Navbar";
import { Search, MoreVertical, Edit, Trash } from "lucide-react";
import Link from "next/link";
import Select,{StylesConfig} from "react-select";
import { departments, semesters } from "@/types/constant";

interface Course {
  courseid: number;
  coursename: string;
  department: string;
  semester: string;
  teachername: string;
}

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [semesterLoading, setSemesterLoading] = useState(false);
  const [departmentLoading, setDepartmentLoading] = useState(false);

  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const semesterOptions = [
    { value: "All", label: "All Semesters" },
    ...semesters.map((sem) => ({ value: sem, label: sem })),
  ];

  const departmentOptions = [
    { value: "All", label: "All Departments" },
    ...departments.map((dept) => ({ value: dept, label: dept })),
  ];

  const handleToggleDropdown = (id: number) => {
    setOpenDropdownId((prevId) => (prevId === id ? null : id));
  };

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/course/get");
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
      const matchesSearch =
        course.coursename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseid.toString().includes(searchTerm);
      const matchesSemester =
        selectedSemester === "All" || course.semester === selectedSemester;
      const matchesDepartment =
        selectedDepartment === "All" || course.department === selectedDepartment;

      return matchesSearch && matchesSemester && matchesDepartment;
    });

    setFilteredCourses(results);
  }, [searchTerm, selectedSemester, selectedDepartment, courses]);

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

  const handleSemesterChange = (selectedOption: any) => {
    setSemesterLoading(true);
    setSelectedSemester(selectedOption.value);
    setTimeout(() => setSemesterLoading(false), 500);
  };

  const handleDepartmentChange = (selectedOption: any) => {
    setDepartmentLoading(true);
    setSelectedDepartment(selectedOption.value);
    setTimeout(() => setDepartmentLoading(false), 500);
  };

   const customStyles: StylesConfig = {
      control: (provided, state) => ({
        ...provided,
        borderColor: state.isFocused ? "black" : provided.borderColor,
        boxShadow: state.isFocused ? "0 0 0 1px black" : provided.boxShadow,
        "&:hover": {
          borderColor: "black",
        },
      }),
    };

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
            Manage course information and assignments.
          </p>
        </div>

        {/* Filters */}

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative w-full sm:w-[30%]">
            <Select
              options={semesterOptions}
              value={semesterOptions.find(
                (opt) => opt.value === selectedSemester
              )}
              onChange={handleSemesterChange}
              isSearchable={true}
              className="w-full"
              styles={customStyles}
            />
            {semesterLoading && (
              <div className="absolute top-2 right-2 w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin z-10 bg-white"></div>
            )}
          </div>

          <div className="relative w-full sm:w-[30%]">
            <Select
              options={departmentOptions}
              value={departmentOptions.find(
                (opt) => opt.value === selectedDepartment
              )}
              onChange={handleDepartmentChange}
              isSearchable={true}
              className="w-full"
              styles={customStyles}
            />
            {departmentLoading && (
              <div className="absolute top-2 right-2 w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin z-10 bg-white"></div>
            )}
          </div>
        </div>

        {/* Search + Add */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-5 mb-8">
          <div className="relative w-full sm:w-1/2">
            <Search
              size={20}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by course name or ID"
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          </div>

          <Link href="/admin_dashboard/courses/new" className="w-full sm:w-auto">
            <button className="bg-black cursor-pointer text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition w-full">
              Add New Course
            </button>
          </Link>
        </div>

        {/* Table / Loading / No Data */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="py-3 px-6 text-left">Course ID</th>
                <th className="py-3 px-6 text-left">Course Name</th>
                <th className="py-3 px-6 text-left">Department</th>
                <th className="py-3 px-6 text-left">Semester</th>
                <th className="py-3 px-6 text-left">Assigned Teacher</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="py-4 px-6 text-center text-gray-500">
                    Record not found
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.courseid} className="border-b hover:bg-gray-50 transition">
                    <td className="py-3 px-6">{course.courseid}</td>
                    <td className="py-3 px-6">{course.coursename}</td>
                    <td className="py-3 px-6">{course.department}</td>
                    <td className="py-3 px-6">{course.semester}</td>
                    <td className="py-3 px-6">{course.teachername}</td>
                    <td className="py-3 px-6 text-center relative">
                      <div ref={dropdownRef}>
                        <button
                          onClick={() => handleToggleDropdown(course.courseid)}
                          className="p-1 rounded-full hover:bg-gray-200"
                        >
                          <MoreVertical size={18} />
                        </button>
                        {openDropdownId === course.courseid && (
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
                ))
              )}
            </tbody>
          </table>
          {loading && (
            <div className="py-6 flex justify-center items-center">
              <div className="w-6 h-6 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
              <span className="ml-2 text-sm text-gray-500">Loading...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
