"use client";
import { Search } from "lucide-react";
import * as XLSX from "xlsx";
import Navbar from "@/components/teacher/Navbar";

export default function Page() {
  const students = [
    {
      name: "Ali Raza",
      regNo: "UET-001",
      totalAttendance: 40,
      percentage: "90%",
    },
    {
      name: "Sumaira Khan",
      regNo: "UET-002",
      totalAttendance: 38,
      percentage: "85%",
    },
    {
      name: "Adnan Amin",
      regNo: "UET-003",
      totalAttendance: 42,
      percentage: "95%",
    },
  ];

  // Function to export table data to XLS
  const exportToExcel = () => {
    const ws = XLSX.utils.table_to_sheet(
      document.getElementById("studentTable")
    );
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
            CourseId:
          </h1>
          <p className="text-2xl md:text-3xl text-[#595959] font-semibold">CS-364 Information Security</p>
        </div>
        <p className="text-sm md:text-md text-[#595959] mt-1">
          Manage registered students and their attendance records
        </p>


        <div>
        <select
              className="w-full sm:w-[30%] h-10 text-sm md:text-md rounded-md p-2 border-2 border-[#e0e5e9]"
              defaultValue=""
            >
              <option value="" disabled>
                Select Department
              </option>
              <option value="a">A</option>
              <option value="b">B</option>
              <option value="c">C</option>
              <option value="d">D</option>
            </select>

        </div>
        {/* Drop Down box */}
        <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-5">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-5 w-full sm:w-1/2">
            <select
              className="w-full sm:w-[30%] h-10 text-sm md:text-md rounded-md p-2 border-2 border-[#e0e5e9]"
              defaultValue=""
            >
              <option value="" disabled>
                Filter by Section
              </option>
              <option value="a">A</option>
              <option value="b">B</option>
              <option value="c">C</option>
              <option value="d">D</option>
            </select>

            {/* Search Bar */}
            <div className="relative w-full sm:w-[50%]">
              <Search
                size={20}
                color="#595959"
                className="absolute left-3 top-2"
              />
              <input
                type="text"
                className="w-full h-10 pl-10 text-sm md:text-md rounded-md p-3 border-2 border-[#e0e5e9]"
                placeholder="Search by name or studentID..."
              />
            </div>
          </div>
          {/* Download Button */}
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
                <th className="py-3 px-4 md:px-6 text-center">
                  Total Attendance
                </th>
                <th className="py-3 px-4 md:px-6 text-center">Percentage</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-xs md:text-sm font-light">
              {students.map((student, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-4 md:px-6 text-left">
                    {student.name}
                  </td>
                  <td className="py-3 px-4 md:px-6 text-left">
                    {student.regNo}
                  </td>
                  <td className="py-3 px-4 md:px-6 text-center">
                    {student.totalAttendance}
                  </td>
                  <td className="py-3 px-4 md:px-6 text-center">
                    {student.percentage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
}
