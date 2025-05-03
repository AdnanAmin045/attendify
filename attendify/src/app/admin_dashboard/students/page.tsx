"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/admin/Navbar";
import { Search, MoreVertical, Edit, Trash } from "lucide-react";
import { departments, sections } from "@/types/constant";
import Link from "next/link";

interface Student {
  id: number;
  name: string;
  regNo: string;
  department: string;
  section: string;
  email: string;
  phone: string;
  image_url: string;
}

export default function StudentTable() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/student/get");
        const data = await response.json();
        setStudents(data);
        setFilteredStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    let result = [...students];
    if (departmentFilter) {
      result = result.filter(
        (student) =>
          student.department.toLowerCase() === departmentFilter.toLowerCase()
      );
    }
    if (sectionFilter) {
      result = result.filter(
        (student) =>
          student.section.toLowerCase() === sectionFilter.toLowerCase()
      );
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (student) =>
          student.name.toLowerCase().includes(term) ||
          student.regNo.toLowerCase().includes(term)
      );
    }
    setFilteredStudents(result);
  }, [students, departmentFilter, sectionFilter, searchTerm]);

  const handleToggleDropdown = (id: number) => {
    setOpenDropdownId((prevId) => (prevId === id ? null : id));
  };

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
      <div className="hidden sm:block fixed h-full z-40">
        <Navbar />
      </div>

      <div className="sm:hidden fixed top-4 left-4 z-50">
        <Navbar />
      </div>

      <div className="flex-1 overflow-auto ml-0 sm:ml-20 lg:ml-64 px-4 sm:px-8 py-10">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-bold">Student Management</h1>
          <p className="text-sm text-gray-600">
            Manage student profiles and records.
          </p>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
            >
              <option value="">All Departments</option>
              {departments.map((dept, index) => (
                <option key={`${dept}-${index}`} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
            >
              <option value="">All Sections</option>
              {sections.map((section, index) => (
                <option key={`${section}-${index}`} value={section}>
                  {section}
                </option>
              ))}
            </select>

            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-3 top-2.5 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by name or reg no"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
              />
            </div>

            <Link href="/admin_dashboard/students/new" className="w-full sm:w-auto">
              <button className="w-full bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition cursor-pointer">
                Add New Student
              </button>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          {loading ? (
            <div className="py-6 flex justify-center items-center">
              <div className="w-6 h-6 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
              <span className="ml-2 text-sm text-gray-500">Loading...</span>
            </div>
          ) : (
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="py-3 px-6 text-left">Student Name</th>
                  <th className="py-3 px-6 text-left">Reg No</th>
                  <th className="py-3 px-6 text-left">Department</th>
                  <th className="py-3 px-6 text-left">Section</th>
                  <th className="py-3 px-6 text-left">Email</th>
                  <th className="py-3 px-6 text-left">Phone</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          {student.image_url && (
                            <img
                              src={student.image_url}
                              alt={student.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <span>{student.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6">{student.regNo}</td>
                      <td className="py-3 px-6">{student.department}</td>
                      <td className="py-3 px-6">{student.section}</td>
                      <td className="py-3 px-6">{student.email}</td>
                      <td className="py-3 px-6">{student.phone}</td>
                      <td className="py-3 px-6 text-center relative">
                        <div ref={dropdownRef}>
                          <button
                            onClick={() => handleToggleDropdown(student.id)}
                            className="p-1 rounded-full hover:bg-gray-200"
                          >
                            <MoreVertical size={18} />
                          </button>
                          {openDropdownId === student.id && (
                            <div className="absolute right-6 mt-2 w-28 bg-white border rounded-md shadow-lg z-10">
                              <Link
                                href={`/admin_dashboard/students/edit/${student.id}`}
                                className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-sm"
                              >
                                <Edit className="w-4 h-4 mr-2" /> Edit
                              </Link>
                              <button className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-sm text-red-500">
                                <Trash className="w-4 h-4 mr-2" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-gray-500">
                      No students found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
