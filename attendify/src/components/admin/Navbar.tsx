"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  Book,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import logo from "@/../public/logo.png";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      if (window.innerWidth >= 640) {
        setOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin_dashboard" },
    { label: "Teachers", icon: Users, href: "/admin_dashboard/teachers" },
    { label: "Courses", icon: Book, href: "/admin_dashboard/courses" },
    { label: "Students", icon: GraduationCap, href: "/admin_dashboard/students" },
    { label: "Class Schedule", icon: Calendar, href: "/admin_dashboard/schedule" },
    { label: "Logout", icon: LogOut, href: "#", onClick: handleLogout }, // Updated to use handleLogout
  ];

 

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed h-full z-50 border-r-2 border-[#f0f0f0] ${
          open ? "w-64" : "w-0 sm:w-20 lg:w-64"
        } overflow-hidden sm:overflow-visible transition-all duration-300 flex flex-col bg-white`}
      >
        {/* Top logo & toggle */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Image
              src={logo}
              alt="logo"
              className="w-10 h-10"
              width={40}
              height={40}
            />
            <span
              className={`text-xl font-bold ${
                !open && "hidden sm:hidden lg:block"
              }`}
            >
              Attendify
            </span>
          </div>
          {isMobile && open && (
            <button
              onClick={() => setOpen(false)}
              className="sm:hidden block text-black"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Menu items */}
        <nav className="flex flex-col mt-10 gap-2">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={index}
                href={item.href}
                onClick={item.onClick} // Ensure logout calls the handleLogout function
                className={`flex items-center gap-4 p-3 mx-2 text-sm rounded-md transition-colors duration-200 cursor-pointer
                  ${isActive ? "bg-black text-white" : "hover:bg-[#f8f9fb]"}`}
              >
                <item.icon size={24} />
                <span
                  className={`${
                    !open && "hidden sm:hidden lg:block"
                  } origin-left duration-200`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {open && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      {isMobile && (
        <button
          onClick={() => setOpen(true)}
          className="sm:hidden fixed top-4 left-4 z-50 text-black bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
        >
          <Menu size={24} />
        </button>
      )}
    </>
  );
}
