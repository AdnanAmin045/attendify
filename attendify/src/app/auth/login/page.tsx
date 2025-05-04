"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import logo from '@/../public/logo.png';
import { toast} from 'react-hot-toast';
  import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email:string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      toast.error('Invalid email format');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Login successful');
        if (data.status === 1) {
          router.push('/admin_dashboard');
        } else if (data.status === 2) {
          router.push('/teacher_panel/registered_student');
        } else {
          toast.error('Unknown user role');
        }

      } else {
        toast.error(data.message || 'Invalid credentials');
      }
    } catch (err) {
      toast.error('Something went wrong');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full max-w-md sm:border-2 sm:border-[#e0e5e9] sm:bg-white rounded-md flex flex-col items-center gap-6 justify-center px-5 py-10">
        <div className="flex items-center gap-3">
          <Image src={logo} alt="logo" className="w-15 h-15" />
          <h1 className="text-3xl font-bold">Attendify</h1>
        </div>
        <div className="w-full">
          <label htmlFor="email" className="text-sm text-[#595959] pl-1">Email</label>
          <input
            type="email"
            className="p-2 w-full text-sm border-2 rounded-md border-[#e0e5e9]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="w-full relative">
          <label htmlFor="password" className="text-sm text-[#595959] pl-1">Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            className="p-2 w-full text-sm border-2 rounded-md border-[#e0e5e9]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="absolute right-3 top-9 cursor-pointer text-sm text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`text-lg w-full p-2 rounded-md ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black text-white'
          }`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </div>
  );
}
