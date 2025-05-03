"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/admin/Navbar";
import {
  Search,
  MoreVertical,
  Edit,
  Trash,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { departments } from "@/types/constant";
import Select, { StylesConfig } from "react-select";

export interface Teacher {
  employeeid: string;
  full_name: string;
  department: string;
  email: string;
  password: string;
}

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [visiblePasswords, setVisiblePasswords] = useState<{
    [key: string]: boolean;
  }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch(`/api/teacher/get`);
        const data = await res.json();
        setTeachers(data);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const handleDepartmentChange = (selectedOption: any) => {
    const newDepartment = selectedOption ? selectedOption.value : "All";
    setSelectedDepartment(newDepartment);
    setFiltering(true);

    // Simulate filtering delay
    setTimeout(() => {
      setFiltering(false);
    }, 500);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleDropdown = (id: string) => {
    setOpenDropdownId((prevId) => (prevId === id ? null : id));
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.employeeid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "All" || teacher.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const departmentOptions = [
    { value: "All", label: "All" },
    ...departments.map((dep) => ({
      value: dep,
      label: dep,
    })),
  ];

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
          <h1 className="text-3xl font-bold">Teacher Management</h1>
          <p className="text-sm text-gray-600">
            Manage teacher information and assignments.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2 w-full sm:w-1/3">
            <Select
              id="department"
              name="department"
              options={departmentOptions}
              value={departmentOptions.find(
                (opt) => opt.value === selectedDepartment
              )}
              onChange={handleDepartmentChange}
              className="react-select-container z-50 w-full"
              classNamePrefix="react-select"
              placeholder="Select Department"
              styles={customStyles}
            />
            {filtering && (
              <Loader2 className="animate-spin text-gray-600" size={20} />
            )}
          </div>
        </div>

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
              placeholder="Search by name, ID, or email"
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          </div>
          <Link
            href="/admin_dashboard/teachers/new"
            className="w-full sm:w-auto"
          >
            <button className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 cursor-pointer">
              Add New Teacher
            </button>
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="py-3 px-6 text-left">Employee ID</th>
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Department</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Password</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length === 0 && !loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-4 px-6 text-center text-gray-500"
                  >
                    Record not found
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr
                    key={teacher.employeeid}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-6">{teacher.employeeid}</td>
                    <td className="py-3 px-6">{teacher.full_name}</td>
                    <td className="py-3 px-6">{teacher.department}</td>
                    <td className="py-3 px-6">{teacher.email}</td>
                    <td className="py-3 px-6 flex items-center gap-2">
                      <span>
                        {visiblePasswords[teacher.employeeid]
                          ? teacher.password
                          : "•".repeat(teacher.password.length)}
                      </span>
                      <button
                        onClick={() =>
                          togglePasswordVisibility(teacher.employeeid)
                        }
                      >
                        {visiblePasswords[teacher.employeeid] ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-6 text-center relative">
                      <div ref={dropdownRef}>
                        <button
                          onClick={() =>
                            handleToggleDropdown(teacher.employeeid)
                          }
                          className="p-1 rounded-full hover:bg-gray-200"
                        >
                          <MoreVertical size={18} />
                        </button>
                        {openDropdownId === teacher.employeeid && (
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

          {/* Loading Spinner */}
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
