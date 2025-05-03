import React from "react";
import Image from "next/image";
import logo from "@/../public/logo.png"

export default function page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="w-full max-w-md sm:border-2 sm:border-[#e0e5e9] sm:bg-white rounded-md flex flex-col items-center gap-6 justify-center px-5 py-10">
        <div className="flex items-center gap-3">
          <Image src={logo} alt="logo" className="w-15 h-15 "/>
          <h1 className="text-3xl font-bold">Attendify</h1>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="text-3xl font-medium">Login</p>
          <p className="text-md text-[#595959]">
            Enter your credentials to access the panel
          </p>
        </div>
        <div className="w-full">
          <label htmlFor="email" className="text-sm text-[#595959] pl-1">Email</label>
          <input type="text" className="p-2 w-full text-sm border-2 rounded-md border-[#e0e5e9]" />
        </div>
        <div className="w-full">
          <label htmlFor="email" className="text-sm text-[#595959] pl-1">Password</label>
          <input type="password" className="p-2 w-full text-sm border-2 rounded-md border-[#e0e5e9]" />
        </div>
        <button className="text-lg w-full bg-black text-white p-2 rounded-md">
          Login
        </button>
      </div>
    </div>
  );
}
