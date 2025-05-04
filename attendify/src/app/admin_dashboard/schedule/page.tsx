"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/admin/Navbar";
import { Search, MoreVertical, Edit, Trash } from "lucide-react";
import Link from "next/link";
import Select, { StylesConfig, ActionMeta, SingleValue } from "react-select";

interface Course {
  courseinfo: string;
  department: string;
  section: string;
  semester: number;
  day: string;
  timerange: string;
  teacher_name: string;
}

interface SelectOption {
  value: string;
  label: string;
}

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<SelectOption | null>(null);
  const [selectedSection, setSelectedSection] = useState<SelectOption | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<SelectOption | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const customSelectStyles: StylesConfig<SelectOption> = {
    control: (provided) => ({
      ...provided,
      minHeight: '40px',
      borderColor: '#d1d5db',
      '&:hover': {
        borderColor: '#9ca3af',
      },
      boxShadow: 'none',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? 'black' : state.isFocused ? '#f3f4f6' : 'white',
      color: state.isSelected ? 'white' : 'black',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'black',
    }),
  };

  const departments = [
    { value: "All", label: "All Departments" },
    { value: "Computer Science", label: "Computer Science" },
    { value: "Software Engineering", label: "Software Engineering" }
  ];

  const sections = [
    { value: "All", label: "All Sections" },
    { value: "A", label: "Section A" },
    { value: "B", label: "Section B" },
    { value: "C", label: "Section C" },
    { value: "D", label: "Section D" }
  ];

  const semesters = [
    { value: "All", label: "All Semesters" },
    { value: "1", label: "Semester 1" },
    { value: "2", label: "Semester 2" },
    { value: "3", label: "Semester 3" },
    { value: "4", label: "Semester 4" },
    { value: "5", label: "Semester 5" },
    { value: "6", label: "Semester 6" },
    { value: "7", label: "Semester 7" },
    { value: "8", label: "Semester 8" }
  ];

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
        !selectedDepartment || 
        selectedDepartment.value === "All" || 
        course.department === selectedDepartment.value;

      const matchesSection = 
        !selectedSection || 
        selectedSection.value === "All" || 
        course.section === selectedSection.value;

      const matchesSemester = 
        !selectedSemester || 
        selectedSemester.value === "All" || 
        course.semester.toString() === selectedSemester.value;

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <Select<SelectOption>
              options={departments}
              value={selectedDepartment}
              onChange={(newValue: SingleValue<SelectOption>) => setSelectedDepartment(newValue)}
              styles={customSelectStyles}
              placeholder="Select Department"
              isClearable
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <Select<SelectOption>
              options={sections}
              value={selectedSection}
              onChange={(newValue: SingleValue<SelectOption>) => setSelectedSection(newValue)}
              styles={customSelectStyles}
              placeholder="Select Section"
              isClearable
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <Select<SelectOption>
              options={semesters}
              value={selectedSemester}
              onChange={(newValue: SingleValue<SelectOption>) => setSelectedSemester(newValue)}
              styles={customSelectStyles}
              placeholder="Select Semester"
              isClearable
            />
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
              placeholder="Search by course info"
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          </div>

          <Link
            href="/admin_dashboard/schedule/new"
            className="w-full sm:w-auto"
          >
            <button className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition w-full">
              Add New Schedule
            </button>
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
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
              {filteredCourses.length === 0 && !loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-4 px-6 text-center text-gray-500"
                  >
                    No courses found
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course, index) => (
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