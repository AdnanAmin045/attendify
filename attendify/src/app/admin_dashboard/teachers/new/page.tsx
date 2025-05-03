"use client";

import { ChevronLeft, UserPlus } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/admin/Navbar";
import { Teacher } from "../../../../types/index";
import toast, { Toaster } from "react-hot-toast";
import { departments } from "@/types/constant";
import Select, { StylesConfig } from "react-select";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [teacher, setTeacher] = useState<Teacher>({
    employeeId: "",
    full_name: "",
    department: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTeacher((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDepartmentChange = (selectedOption: any) => {
    setTeacher((prev) => ({
      ...prev,
      department: selectedOption.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { employeeId, full_name, department, email } = teacher;
    console.log("Teacher: ",teacher)
    if (!employeeId || !full_name || !department || !email) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/teacher/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeid: employeeId,
          full_name,
          department,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Something went wrong");

      toast.success("Teacher added successfully");
      setTeacher({
        employeeId: "",
        full_name: "",
        department: "",
        email: "",
        password: "",
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const departmentOptions = departments.map((dep) => ({
    value: dep,
    label: dep,
  }));

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
      <div className="hidden sm:block fixed h-full z-40">
        <Navbar />
      </div>
      <div className="sm:hidden fixed top-4 left-4 z-50">
        <Navbar />
      </div>
      <div className="flex-1 overflow-auto ml-0 sm:ml-20 lg:ml-64 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-2 mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/admin_dashboard/teachers"
                className="text-gray-700 hover:text-black flex items-center gap-2 bg-gray-200 hover:bg-gray-300 p-2 rounded-lg transition"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="sr-only sm:not-sr-only">Back</span>
              </Link>
              <div className="flex items-center gap-3">
                <UserPlus className="w-8 h-8 text-gray-800" />
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Add New Teacher
                </h1>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Fill the form to register a new teacher. Fields marked with{" "}
              <span className="text-red-500">*</span> are required.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="employeeId"
                    className="block text-sm font-medium text-gray-800"
                  >
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="employeeId"
                    name="employeeId"
                    value={teacher.employeeId}
                    onChange={handleChange}
                    placeholder="Enter employee ID"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="full_name"
                    className="block text-sm font-medium text-gray-800"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={teacher.full_name}
                    onChange={handleChange}
                    placeholder="Enter teacher's full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-800"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={teacher.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-gray-800"
                  >
                    Department <span className="text-red-500">*</span>
                  </label>
                  <Select
                    id="department"
                    name="department"
                    options={departmentOptions}
                    value={departmentOptions.find(
                      (opt) => opt.value === teacher.department
                    )}
                    onChange={handleDepartmentChange}
                    className="react-select-container z-50"
                    classNamePrefix="react-select"
                    placeholder="Select Department"
                    styles={customStyles}
                    menuPortalTarget={
                      typeof window !== "undefined" ? document.body : null
                    }
                    menuPosition="fixed"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full cursor-pointer py-3 px-6 rounded-lg font-medium text-white flex justify-center items-center gap-2 transition ${
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
                    "Register Teacher"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
