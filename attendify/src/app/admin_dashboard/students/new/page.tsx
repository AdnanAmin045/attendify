"use client";
import React, { useState } from "react";
import { ChevronLeft, UploadCloud, X } from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "@/components/admin/Navbar";
import { departments } from "@/types/constant";

type Course = {
  id: number;
  name: string;
};

const Page = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [section, setSection] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [regNo, setRegNo] = useState("");
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const fetchCourses = async (department: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/student/courses_forDep?department=${department}`
      );
      const data = await response.json();
      setAvailableCourses(data);
    } catch (error) {
      console.error("Error fetching courses", error);
      toast.error("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const department = e.target.value;
    setSelectedDepartment(department);
    setSelectedCourses([]);
    if (department) {
      fetchCourses(department);
    } else {
      setAvailableCourses([]);
    }
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value);
    const selectedCourse = availableCourses.find((c) => c.id === selectedId);
    if (
      selectedCourse &&
      !selectedCourses.find((c) => c.id === selectedCourse.id)
    ) {
      setSelectedCourses((prev) => [...prev, selectedCourse]);
    }
  };

  const handleRemoveCourse = (courseToRemove: Course) => {
    setSelectedCourses((prev) =>
      prev.filter((c) => c.id !== courseToRemove.id)
    );
  };

  const uploadToCloudinary = async (imageFile: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "attendify_profile_pictures");

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dyas5xcyf/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      throw new Error("Image upload failed");
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!regNo || !name || !selectedDepartment || !section || !email) {
      toast.error("Please fill all required fields");
      setLoading(false);
      return;
    }

    try {
      let uploadedImageUrl = "";
      let imageBytea = "";
      
      if (imageFile) {
        uploadedImageUrl = await uploadToCloudinary(imageFile);
        imageBytea = await convertToBase64(imageFile);
      }

      const studentData = {
        regNo,
        name,
        department: selectedDepartment,
        section,
        email,
        phone,
        image_url: uploadedImageUrl,
        image_bytea: imageBytea,
        courses: selectedCourses.map((c) => c.id),
      };

      const response = await fetch("/api/student/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        throw new Error("Failed to add student");
      }

      toast.success("Student added successfully!");
      // Reset form
      setRegNo("");
      setName("");
      setSelectedDepartment("");
      setSection("");
      setEmail("");
      setPhone("");
      setSelectedCourses([]);
      setImageFile(null);
      setImagePreview("");
    } catch (error) {
      console.error("Error submitting form", error);
      toast.error("Error submitting form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
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
          <div className="flex flex-col gap-2 mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/admin_dashboard/students"
                className="text-gray-700 hover:text-black flex items-center gap-2 bg-gray-200 hover:bg-gray-300 p-2 rounded-lg transition"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="sr-only sm:not-sr-only">Back</span>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Add New Student
              </h1>
            </div>
            <p className="text-sm text-gray-600">
              Fill out the form to add a new student. Fields marked with <span className="text-red-500">*</span> are required.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Reg No */}
                <div className="space-y-2">
                  <label htmlFor="regNo" className="block text-sm font-medium text-gray-800">
                    Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="regNo"
                    name="regNo"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="Enter registration number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                    required
                  />
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-800">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter student's full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                    required
                  />
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <label htmlFor="department" className="block text-sm font-medium text-gray-800">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={selectedDepartment}
                    onChange={handleDepartmentChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
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

                {/* Section */}
                <div className="space-y-2">
                  <label htmlFor="section" className="block text-sm font-medium text-gray-800">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="section"
                    name="section"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                    required
                  >
                    <option value="">Select Section</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-800">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter student's email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-800">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                  />
                </div>

                {/* Courses - Only shown when department is selected */}
                {selectedDepartment && (
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="courses" className="block text-sm font-medium text-gray-800">
                      Courses
                    </label>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-2">
                        <select
                          id="courses"
                          name="courses"
                          onChange={handleCourseChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                          disabled={availableCourses.length === 0}
                        >
                          <option value="">Select Course</option>
                          {Array.isArray(availableCourses) &&
                            availableCourses.map((course) => (
                              <option key={course.id} value={course.id}>
                                {course.name}
                              </option>
                            ))}
                        </select>
                        {availableCourses.length === 0 && !isLoading && (
                          <p className="text-sm text-gray-600">No courses available for this department</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Image Upload */}
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-800">
                    Profile Picture
                  </label>
                  <div className="mt-1 flex items-center">
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center justify-center w-full px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                    >
                      <div className="flex flex-col items-center justify-center">
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="h-32 w-32 object-cover rounded-full border-4 border-white shadow"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setImageFile(null);
                                setImagePreview("");
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">
                              <span className="font-medium text-black hover:text-gray-800">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, JPEG up to 5MB
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        id="image-upload"
                        name="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error("File size exceeds 5MB limit");
                              return;
                            }
                            setImageFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setImagePreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Selected Courses */}
              {selectedCourses.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-sm font-medium text-gray-800">
                    Selected Courses
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200"
                      >
                        <span className="text-sm text-gray-900">{course.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCourse(course)}
                          className="text-red-500 hover:text-red-700 transition"
                          aria-label={`Remove ${course.name}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-6 rounded-lg font-medium text-white flex justify-center items-center gap-2 transition ${
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
                    "Add Student"
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