"use client";
import Link from "next/link";
import Image from 'next/image';
import { usePathname } from "next/navigation";
import logo from "../../../public/logo.png";
import { UserRoundCheck, ClipboardPenLine, Users, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="flex gap-30 items-center px-10 py-4">
      <div className="flex items-center gap-4">
        <Image src={logo} alt="logo" className="w-10 h-10" />
        <h1 className="text-lg">Face Detection</h1>
      </div>

      <div className="flex gap-10 items-center">
        <Link
          href="/teacher_dashboard"
          className={`p-3 flex gap-2 text-sm items-center rounded-sm ${
            isActive("/teacher_dashboard")
              ? "bg-[#171717] text-white"
              : "hover:bg-[#f8f9fb]"
          }`}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        <Link
          href="/teacher_dashboard/registered_student"
          className={`p-3 flex gap-2 text-sm items-center rounded-sm ${
            isActive("/teacher_dashboard/registered_student")
              ? "bg-[#171717] text-white"
              : "hover:bg-[#f8f9fb]"
          }`}
        >
          <UserRoundCheck size={20} />
          Register Student
        </Link>

        <Link
          href="/teacher_dashboard/markattendance"
          className={`p-3 flex gap-2 text-sm items-center rounded-sm ${
            isActive("/teacher_dashboard/markattendance")
              ? "bg-[#171717] text-white"
              : "hover:bg-[#f8f9fb]"
          }`}
        >
          <ClipboardPenLine strokeWidth={1.75} size={20} />
          Mark Attendance
        </Link>

        <Link
          href="/teacher_dashboard/student"
          className={`p-3 flex gap-2 text-sm items-center rounded-sm ${
            isActive("/teacher_dashboard/student")
              ? "bg-[#171717] text-white"
              : "hover:bg-[#f8f9fb]"
          }`}
        >
          <Users strokeWidth={1.75} size={20} />
          Student
        </Link>
      </div>
    </nav>
  );
}
