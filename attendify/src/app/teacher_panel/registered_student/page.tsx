"use client";
import { Search } from "lucide-react";
import * as XLSX from "xlsx";
import Navbar from "@/components/teacher/Navbar";
import { useEffect, useState } from "react";
import { Student, Course, Department } from "../../../types/registeredStudent";
import Select from 'react-select';

export default function Page() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  
  // Options for dropdowns
  const [departmentOptions, setDepartmentOptions] = useState<{value: string, label: string}[]>([]);
  const [courseOptions, setCourseOptions] = useState<{value: string, label: string}[]>([]);
  const [sectionOptions, setSectionOptions] = useState<{value: string, label: string}[]>([]);
  
  // Selected values
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/registeredStudent/get");
        const data: Department[] = await response.json();
        setDepartments(data);
        
        // Format department options for react-select
        const deptOptions = data.map(dept => ({
          value: dept.department,
          label: dept.department
        }));
        setDepartmentOptions(deptOptions);
        
        // Flatten all students for initial display
        const allStudents = data.flatMap(dept => 
          dept.courses.flatMap(course => course.students)
        );
        setFilteredStudents(allStudents);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Update course options when department changes
    if (selectedDepartment) {
      const dept = departments.find(d => d.department === selectedDepartment);
      const courses = dept?.courses.map(course => ({
        value: course.id.toString(),
        label: `${course.courseName} (${course.courseid})`
      })) || [];
      setCourseOptions(courses);
    } else {
      setCourseOptions([]);
    }
    setSelectedCourse("");
    setSelectedSection("");
  }, [selectedDepartment, departments]);

  useEffect(() => {
    // Update section options when course changes
    if (selectedCourse && selectedDepartment) {
      const dept = departments.find(d => d.department === selectedDepartment);
      const course = dept?.courses.find(c => c.id.toString() === selectedCourse);
      const sections = [
        ...new Set(course?.students.map(s => s.section || "").filter(Boolean))
      ].map(section => ({
        value: section,
        label: `Section ${section}`
      }));
      setSectionOptions(sections);
    } else {
      setSectionOptions([]);
    }
    setSelectedSection("");
  }, [selectedCourse, selectedDepartment, departments]);

  useEffect(() => {
    // Filter students based on selections
    let result: Student[] = [];

    if (!selectedDepartment && !selectedCourse && !selectedSection) {
      // No filters - show all students
      result = departments.flatMap(dept => 
        dept.courses.flatMap(course => course.students)
      );
    } else if (selectedDepartment && !selectedCourse) {
      // Only department selected
      const dept = departments.find(d => d.department === selectedDepartment);
      result = dept?.courses.flatMap(course => course.students) || [];
    } else if (selectedDepartment && selectedCourse) {
      // Department and course selected
      const dept = departments.find(d => d.department === selectedDepartment);
      const course = dept?.courses.find(c => c.id.toString() === selectedCourse);
      result = course?.students || [];
      
      // Filter by section if selected
      if (selectedSection) {
        result = result.filter(student => student.section === selectedSection);
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(student => 
        student.full_name.toLowerCase().includes(query) || 
        student.regno.toLowerCase().includes(query)
      );
    }

    setFilteredStudents(result);
  }, [selectedDepartment, selectedCourse, selectedSection, searchQuery, departments]);

  const handleDepartmentChange = (selectedOption: any) => {
    setSelectedDepartment(selectedOption?.value || "");
  };

  const handleCourseChange = (selectedOption: any) => {
    setSelectedCourse(selectedOption?.value || "");
  };

  const handleSectionChange = (selectedOption: any) => {
    setSelectedSection(selectedOption?.value || "");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const exportToExcel = () => {
    const exportData = filteredStudents.map(student => ({
      "Student Name": student.full_name,
      "Registration No": student.regno,
      "Section": student.section || "N/A",
      "Phone": student.phone,
      "Email": student.email,
      "Department": selectedDepartment || "All",
      "Course": selectedCourse 
        ? courseOptions.find(c => c.value === selectedCourse)?.label 
        : "All",
      "Section Filter": selectedSection || "All"
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "students_data.xlsx");
  };

  return (
    <>
      <Navbar/>
      <div className="px-4 md:px-20 py-10">
        <h1 className="text-2xl md:text-3xl font-bold">Student Database</h1>

        <div className="border-2 border-[#e0e5e9] rounded-sm p-5 md:p-10 mt-8 md:mt-10">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <h1 className="text-xl md:text-2xl font-semibold">
              Current Course:
            </h1>
            <p className="text-2xl md:text-3xl text-[#595959] font-semibold">
              {selectedCourse 
                ? courseOptions.find(c => c.value === selectedCourse)?.label 
                : "All Courses"}
            </p>
          </div>
          <p className="text-sm md:text-md text-[#595959] mt-1">
            Manage registered students and their records
          </p>

          {/* Filters with react-select */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              className="basic-single"
              classNamePrefix="select"
              placeholder="Select Department"
              options={departmentOptions}
              onChange={handleDepartmentChange}
              value={departmentOptions.find(option => option.value === selectedDepartment)}
              isClearable
            />

            <Select
              className="basic-single"
              classNamePrefix="select"
              placeholder="Select Course"
              options={courseOptions}
              onChange={handleCourseChange}
              value={courseOptions.find(option => option.value === selectedCourse)}
              isDisabled={!selectedDepartment}
              isClearable
            />

            <Select
              className="basic-single"
              classNamePrefix="select"
              placeholder="Select Section"
              options={sectionOptions}
              onChange={handleSectionChange}
              value={sectionOptions.find(option => option.value === selectedSection)}
              isDisabled={!selectedCourse}
              isClearable
            />
          </div>

          {/* Search and Download */}
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-5">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-5 w-full sm:w-1/2">
              <div className="relative w-full">
                <Search
                  size={20}
                  color="#595959"
                  className="absolute left-3 top-2"
                />
                <input
                  type="text"
                  className="w-full h-10 pl-10 text-sm md:text-md rounded-md p-3 border-2 border-[#e0e5e9]"
                  placeholder="Search by name or registration no..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={exportToExcel}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Download as XLS
              </button>
            </div>
          </div>

          {/* Student Table */}
          <div className="overflow-x-auto mt-6">
            <table
              id="studentTable"
              className="min-w-full bg-white border border-gray-200 rounded-md"
            >
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-xs md:text-sm leading-normal">
                  <th className="py-3 px-4 md:px-6 text-left">Student Name</th>
                  <th className="py-3 px-4 md:px-6 text-left">Reg No</th>
                  <th className="py-3 px-4 md:px-6 text-left">Section</th>
                  <th className="py-3 px-4 md:px-6 text-left">Phone</th>
                  <th className="py-3 px-4 md:px-6 text-left">Email</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-xs md:text-sm font-light">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-gray-200 hover:bg-gray-100"
                    >
                      <td className="py-3 px-4 md:px-6 text-left">
                        {student.full_name}
                      </td>
                      <td className="py-3 px-4 md:px-6 text-left">
                        {student.regno}
                      </td>
                      <td className="py-3 px-4 md:px-6 text-left">
                        {student.section || "N/A"}
                      </td>
                      <td className="py-3 px-4 md:px-6 text-left">
                        {student.phone}
                      </td>
                      <td className="py-3 px-4 md:px-6 text-left">
                        {student.email}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center">
                      No students found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}