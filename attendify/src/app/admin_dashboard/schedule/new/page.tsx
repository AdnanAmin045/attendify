"use client"
import React, { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "@/components/admin/Navbar";
import { departments, semesterOptions, days, sections } from "@/types/constant";
import Select, { StylesConfig, SingleValue } from "react-select";

interface Course {
  id: number;
  name: string;
}

interface SelectOption {
  value: string | number;
  label: string;
}


const SchedulePage = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | number | null>(null);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const customSelectStyles: StylesConfig<SelectOption, false> = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? "black" : provided.borderColor,
      boxShadow: state.isFocused ? "0 0 0 1px black" : provided.boxShadow,
      "&:hover": {
        borderColor: "black",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? 'black' : state.isFocused ? '#f0f0f0' : 'white',
      color: state.isSelected ? 'white' : 'black',
      '&:hover': {
        backgroundColor: '#e0e0e0',
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'black',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9ca3af',
    }),
  };

  const departmentOptions = departments.map((dep) => ({
    value: dep,
    label: dep,
  }));

  const sectionOptions = sections.map((section) => ({
    value: section,
    label: section,
  }));

  const dayOptions = days.map((day) => ({
    value: day,
    label: day,
  }));

  const courseOptions = availableCourses.map((course) => ({
    value: course.id,
    label: course.name,
  }));

  useEffect(() => {
    const fetchCourses = async () => {
      if (selectedDepartment && selectedSemester !== null) {
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
      selectedSemester === null ||
      !selectedCourse ||
      !selectedDay ||
      !startTime ||
      !endTime ||
      !selectedSection
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

      setSelectedDepartment(null);
      setSelectedSemester(null);
      setAvailableCourses([]);
      setSelectedCourse(null);
      setSelectedDay(null);
      setStartTime("");
      setEndTime("");
      setSelectedSection(null);
    } catch (err) {
      toast.error("Failed to save schedule");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
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
                href="/admin_dashboard/schedule"
                className="text-gray-700 hover:text-black flex items-center gap-2 bg-gray-200 hover:bg-gray-300 p-2 rounded-lg transition"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="sr-only sm:not-sr-only">Back</span>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Add Class Schedule
              </h1>
            </div>
            <p className="text-sm text-gray-600">
              Fill out the form to add a new schedule. Fields marked with{" "}
              <span className="text-red-500">*</span> are required.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Department */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-800">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <Select<SelectOption>
                    options={departmentOptions}
                    onChange={(newValue: SingleValue<SelectOption>) =>
                      setSelectedDepartment(newValue?.value as string || null)
                    }
                    value={departmentOptions.find(
                      (option) => option.value === selectedDepartment
                    )}
                    placeholder="Select Department"
                    styles={customSelectStyles}
                    isSearchable
                  />
                </div>

                {/* Semester */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-800">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <Select<SelectOption>
                    options={semesterOptions}
                    onChange={(newValue: SingleValue<SelectOption>) =>
                      setSelectedSemester(newValue?.value ?? null)
                    }
                    value={semesterOptions.find(
                      (option) => option.value === selectedSemester
                    )}
                    placeholder="Select Semester"
                    styles={customSelectStyles}
                    isSearchable
                    isDisabled={!selectedDepartment}
                  />
                </div>
              </div>

              {/* Day */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-800">
                  Day <span className="text-red-500">*</span>
                </label>
                <Select<SelectOption>
                  options={dayOptions}
                  onChange={(newValue: SingleValue<SelectOption>) =>
                    setSelectedDay(newValue?.value as string || null)
                  }
                  value={dayOptions.find((option) => option.value === selectedDay)}
                  placeholder="Select Day"
                  styles={customSelectStyles}
                  isSearchable
                />
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-800">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    className="w-full border rounded p-2"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-800">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    className="w-full border rounded p-2"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-800">
                  Section <span className="text-red-500">*</span>
                </label>
                <Select<SelectOption>
                  options={sectionOptions}
                  onChange={(newValue: SingleValue<SelectOption>) =>
                    setSelectedSection(newValue?.value as string || null)
                  }
                  value={sectionOptions.find(
                    (option) => option.value === selectedSection
                  )}
                  placeholder="Select Section"
                  styles={customSelectStyles}
                  isSearchable
                />
              </div>

              {/* Course */}
              {selectedDepartment && selectedSemester !== null && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-800">
                    Course <span className="text-red-500">*</span>
                  </label>
                  {isLoadingCourses ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                    </div>
                  ) : (
                    <Select<SelectOption>
                      options={courseOptions}
                      onChange={(newValue: SingleValue<SelectOption>) => {
                        const course =
                          availableCourses.find(
                            (c) => c.id === newValue?.value
                          ) || null;
                        setSelectedCourse(course);
                      }}
                      value={courseOptions.find(
                        (option) => option.value === selectedCourse?.id
                      )}
                      placeholder="Select Course"
                      styles={customSelectStyles}
                      isSearchable
                    />
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Add Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;