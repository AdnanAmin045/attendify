"use client";
import {
  ChartOptions,
  ChartData,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js";
import { User, Users, ChartNoAxesColumnIncreasing } from "lucide-react";
import Navbar from "@/components/admin/Navbar";
import { useEffect } from "react";


// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);



export default function HomePage() {


  // useEffect(() => {
  //   const getData = async () => {
  //     const response = await fetch("/api/createTables");
  //     const data = await response.json();
  //     console.log("Response: ", data);
  //   };
  //   getData();
  // }, []);
  // Chart data with correct typing
  const data: ChartData<"line"> = {
    labels: [
      "Week1",
      "Week2",
      "Week3",
      "Week4",
      "Week5",
      "Week6",
      "Week7",
      "Week8",
      "Week9",
      "Week10",
      "Week11",
      "Week12",
      "Week13",
      "Week14",
      "Week15",
      "Week16",
    ],
    datasets: [
      {
        label: "No of Students",
        data: [65, 59, 80, 81, 56, 55, 43, 23, 45, 43, 54, 67, 76, 78, 65, 56],
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        tension: 0.1,
        fill: true,
      },
    ],
  };


  // Chart options with scales correctly typed
  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      x: {
        type: "category",
      },
      y: {
        type: "linear",
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="flex min-h-screen">
      {/* Navbar - fixed width */}
      <div className="hidden sm:block fixed h-full z-40">
        <Navbar />
      </div>

      {/* Mobile Navbar Toggle - shown only on mobile */}
      <div className="sm:hidden fixed top-4 left-4 z-50">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-0 sm:ml-20 lg:ml-64 px-4 sm:px-8 py-10">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        {/* Dashboard statics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-10">
          {/* Card 1 */}
          <div className="border-2 border-[#f0f0f0] rounded-sm h-40 p-4 flex flex-col gap-4 justify-center">
            <div className="flex justify-between items-center text-md font-medium">
              <h1>Total Students</h1>
              <User strokeWidth={1.75} color="#595959" />
            </div>
            <div className="flex flex-col justify-between text-sm">
              <h1 className="text-2xl font-bold">4234</h1>
              <p className="text-md text-[#595959]">Registered in the system</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="border-2 border-[#f0f0f0] rounded-sm h-40 p-4 flex flex-col gap-4 justify-center">
            <div className="flex justify-between items-center text-md font-medium">
              <h1>Present Students</h1>
              <Users strokeWidth={1.75} color="green" />
            </div>
            <div className="flex flex-col justify-between text-sm">
              <h1 className="text-2xl font-bold">4234</h1>
              <p className="text-md text-[#595959]">Students marked present</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="border-2 border-[#f0f0f0] rounded-sm h-40 p-4 flex flex-col gap-4 justify-center">
            <div className="flex justify-between items-center text-md font-medium">
              <h1>Absent Student</h1>
              <Users strokeWidth={1.75} color="red" />
            </div>
            <div className="flex flex-col justify-between text-sm">
              <h1 className="text-2xl font-bold">4234</h1>
              <p className="text-md text-[#595959]">Students not present</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="border-2 border-[#f0f0f0] rounded-sm h-40 p-4 flex flex-col gap-4 justify-center">
            <div className="flex justify-between items-center text-md font-medium">
              <h1>Attendance Rate</h1>
              <ChartNoAxesColumnIncreasing strokeWidth={1.75} />
            </div>
            <div className="flex flex-col justify-between text-sm">
              <h1 className="text-2xl font-bold">34 %</h1>
              <p className="text-md text-[#595959]">Attendance percentage</p>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="py-10 border-2 border-[#f0f0f0] p-5">
          <h1 className="text-3xl font-medium">Weekly Attendance Overview</h1>
          <Line data={data} options={options} />
        </div>
      </div>
    </div>
  );
}
