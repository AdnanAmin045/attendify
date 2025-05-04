import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logo from "../../../public/logo.png";
import { userInfo } from "../../types/index";
import {
  UserRoundCheck,
  ClipboardPenLine,
  Users,
  LayoutDashboard,
  ChevronDown,
  LogOut,
  Mail,
  User,
  Building,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [userInfo, setUserInfo] = useState<userInfo | undefined>(undefined); // Explicitly handle undefined state
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        window.location.href = "/auth/login";
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("An error occurred during logout", error);
    }
  };

  useEffect(() => {
    const getInfo = async () => {
      try {
        const response = await fetch("/api/auth/getInfo");

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        setUserInfo(data);
      } catch (err) {
        console.log("error: ", err);
      } finally {
        setLoading(false);
      }
    };

    getInfo();
  }, []);

  const isActive = (path: string) => pathname === path;

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="flex justify-between items-center px-10 py-4 border-b">
      <div className="flex items-center gap-4">
        <Image src={logo} alt="logo" className="w-10 h-10" />
        <h1 className="text-lg font-medium">Face Detection</h1>
      </div>

      <div className="flex gap-10 items-center">
        <Link
          href="/teacher_panel/registered_student"
          className={`p-3 flex gap-2 text-sm items-center rounded-sm ${
            isActive("/teacher_panel/registered_student")
              ? "bg-[#171717] text-white"
              : "hover:bg-[#f8f9fb]"
          }`}
        >
          <UserRoundCheck size={20} />
          Register Student
        </Link>

        <Link
          href="/teacher_panel/markattendance"
          className={`p-3 flex gap-2 text-sm items-center rounded-sm ${
            isActive("/teacher_panel/markattendance")
              ? "bg-[#171717] text-white"
              : "hover:bg-[#f8f9fb]"
          }`}
        >
          <ClipboardPenLine strokeWidth={1.75} size={20} />
          Mark Attendance
        </Link>

        {/* User Profile Dropdown */}
        <div className="relative ml-4">
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="text-gray-600" size={20} />
            </div>
            <span className="font-medium text-sm">
              {userInfo ? userInfo.full_name : "Loading..."} {/* Check userInfo availability */}
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && userInfo && ( // Only render dropdown if userInfo is available
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-2 z-50 border">
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-medium">{userInfo.full_name}</p>
                <p className="text-xs text-gray-500">{userInfo.department}</p>
              </div>

              <div className="px-4 py-2">
                <div className="flex items-center gap-2 py-1 text-sm text-gray-700">
                  <Mail size={14} className="text-gray-500" />
                  <span>{userInfo.email}</span>
                </div>
                <div className="flex items-center gap-2 py-1 text-sm text-gray-700">
                  <Building size={14} className="text-gray-500" />
                  <span>{userInfo.department} Department</span>
                </div>
              </div>

              <div className="border-t mt-1">
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50" onClick={handleLogout}>
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
