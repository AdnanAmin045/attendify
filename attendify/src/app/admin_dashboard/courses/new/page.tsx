"use client";
import React, { useEffect, useState } from "react";
import { ChevronLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/admin/Navbar";
import { departments, semesters, creditHoursOptions } from "@/types/constant";
import { Teacher_for_courses } from "@/types";
import { Course } from "@/types";
import toast, { Toaster } from "react-hot-toast";
import Select,{StylesConfig} from 'react-select';
import makeAnimated from 'react-select/animated';

const animatedComponents = makeAnimated();

const Page = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Course>({
    courseId: "",
    courseName: "",
    department: "",
    semester: 0,
    creditHours: 0 ,
    assignedTeacher: "",
    teacherDepartment: "",
  });

  const [teachers, setTeachers] = useState<Teacher_for_courses[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // Format options for react-select
  const departmentOptions = departments.map(dep => ({
    value: dep,
    label: dep
  }));

  const semesterOptions = semesters.map(sem => ({
    value: sem,
    label: sem
  }));

  const creditHoursOptionsFormatted = creditHoursOptions.map(hours => ({
    value: hours,
    label: hours
  }));

  const [teacherOptions, setTeacherOptions] = useState<{value: string, label: string}[]>([]);

  useEffect(() => {
    const getData = async () => {
      if (formData.teacherDepartment) {
        setLoadingTeachers(true);
        try {
          const response = await fetch(
            `/api/teacher/getTeachers?department=${formData.teacherDepartment}`
          );
          const data = await response.json();
          setTeachers(data);
          setTeacherOptions(data.map((teacher: Teacher_for_courses) => ({
            value: teacher.id,
            label: teacher.full_name
          })));
        } catch (err) {
          toast.error("Failed to load teachers.");
        } finally {
          setLoadingTeachers(false);
        }
      } else {
        setTeachers([]);
        setTeacherOptions([]);
      }
    };

    getData();
  }, [formData.teacherDepartment]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, selectedOption: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption?.value || "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!formData.assignedTeacher) {
      toast.error("Please select a teacher");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/course/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: formData.courseId,
          courseName: formData.courseName,
          assignedTeacher: formData.assignedTeacher,
          department: formData.department,
          semester: formData.semester,
          creditHours: formData.creditHours,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add course");
      }

      toast.success("Course added successfully!");
      setFormData({
        courseId: "",
        courseName: "",
        department: "",
        semester: 0,
        creditHours: 0,
        assignedTeacher: "",
        teacherDepartment: "",
      });
    } catch (error) {
      console.error("Error adding course:", error);
      toast.error("Error adding course");
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Sidebar Navbar */}
      <div className="hidden sm:block fixed h-full z-40">
        <Navbar />
      </div>

      {/* Mobile Navbar */}
      <div className="sm:hidden fixed top-4 left-4 z-50">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-0 sm:ml-20 lg:ml-64 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-2 mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/admin_dashboard/courses"
                className="text-gray-700 hover:text-black flex items-center gap-2 bg-gray-200 hover:bg-gray-300 p-2 rounded-lg transition"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="sr-only sm:not-sr-only">Back</span>
              </Link>
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-gray-800" />
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Add New Course
                </h1>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Fill out the form to add a new course. Fields marked with <span className="text-red-500">*</span> are required.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Course ID */}
                <div className="space-y-2">
                  <label htmlFor="courseId" className="block text-sm font-medium text-gray-800">
                    Course ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="courseId"
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    placeholder="Enter course ID"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                    required
                  />
                </div>

                {/* Course Name */}
                <div className="space-y-2">
                  <label htmlFor="courseName" className="block text-sm font-medium text-gray-800">
                    Course Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="courseName"
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleInputChange}
                    placeholder="Enter course name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                    required
                  />
                </div>

                {/* Course Department */}
                <div className="space-y-2">
                  <label htmlFor="department" className="block text-sm font-medium text-gray-800">
                    Course Department <span className="text-red-500">*</span>
                    <span className="block text-xs text-gray-500 mt-1">(Department offering the course)</span>
                  </label>
                  <Select
                    id="department"
                    name="department"
                    options={departmentOptions}
                    value={departmentOptions.find(opt => opt.value === formData.department)}
                    onChange={(selected) => handleSelectChange('department', selected)}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={customStyles}
                    placeholder="Select Department"
                    isSearchable
                    required
                  />
                </div>

                {/* Teacher Department */}
                <div className="space-y-2">
                  <label htmlFor="teacherDepartment" className="block text-sm font-medium text-gray-800">
                    Teacher's Department <span className="text-red-500">*</span>
                    <span className="block text-xs text-gray-500 mt-1">(Department to choose teacher from)</span>
                  </label>
                  <Select
                    id="teacherDepartment"
                    name="teacherDepartment"
                    options={departmentOptions}
                    value={departmentOptions.find(opt => opt.value === formData.teacherDepartment)}
                    onChange={(selected) => handleSelectChange('teacherDepartment', selected)}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={customStyles}
                    placeholder="Select Teacher Department"
                    isSearchable
                    required
                  />
                </div>

                {/* Teacher Dropdown */}
                {formData.teacherDepartment && (
                  <div className="space-y-2">
                    <label htmlFor="assignedTeacher" className="block text-sm font-medium text-gray-800">
                      Teacher <span className="text-red-500">*</span>
                    </label>
                    {loadingTeachers ? (
                      <div className="flex items-center justify-center py-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                      </div>
                    ) : (
                      <Select
                        id="assignedTeacher"
                        name="assignedTeacher"
                        options={teacherOptions}
                        value={teacherOptions.find(opt => opt.value === formData.assignedTeacher)}
                        onChange={(selected) => handleSelectChange('assignedTeacher', selected)}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={customStyles}
                        placeholder="Select Teacher"
                        isSearchable
                        required
                      />
                    )}
                  </div>
                )}

                {/* Semester */}
                <div className="space-y-2">
                  <label htmlFor="semester" className="block text-sm font-medium text-gray-800">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <Select
                    id="semester"
                    name="semester"
                    options={semesterOptions}
                    value={semesterOptions.find(opt => opt.value === formData.semester)}
                    onChange={(selected) => handleSelectChange('semester', selected)}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={customStyles}
                    placeholder="Select Semester"
                    isSearchable
                    required
                  />
                </div>

                {/* Credit Hours */}
                <div className="space-y-2">
                  <label htmlFor="creditHours" className="block text-sm font-medium text-gray-800">
                    Credit Hours <span className="text-red-500">*</span>
                    <span className="block text-xs text-gray-500 mt-1">(Select the credit hours for the course)</span>
                  </label>
                  <Select
                    id="creditHours"
                    name="creditHours"
                    options={creditHoursOptionsFormatted}
                    value={creditHoursOptionsFormatted.find(opt => opt.value === formData.creditHours)}
                    onChange={(selected) => handleSelectChange('creditHours', selected)}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={customStyles}
                    placeholder="Select Credit Hours"
                    isSearchable
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-6 cursor-pointer rounded-lg font-medium text-white flex justify-center items-center gap-2 transition ${
                    loading
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-black hover:bg-gray-800 focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                  }`}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                    "Add Course"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;