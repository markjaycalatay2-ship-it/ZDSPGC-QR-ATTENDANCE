"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

function GearsBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
      <svg className="absolute top-20 left-20 w-48 h-48 animate-[spin_8s_linear_infinite]" viewBox="0 0 100 100">
        <path
          d="M50 0 L60 10 L75 10 L85 20 L85 35 L95 45 L95 55 L85 65 L85 80 L75 90 L60 90 L50 100 L40 90 L25 90 L15 80 L15 65 L5 55 L5 45 L15 35 L15 20 L25 10 L40 10 Z"
          fill="none"
          stroke="#2dd4bf"
          strokeWidth="4"
        />
        <circle cx="50" cy="50" r="15" fill="none" stroke="#2dd4bf" strokeWidth="4" />
      </svg>

      <svg className="absolute top-40 right-32 w-64 h-64 animate-[spin_12s_linear_infinite_reverse]" viewBox="0 0 100 100">
        <path
          d="M50 0 L60 10 L75 10 L85 20 L85 35 L95 45 L95 55 L85 65 L85 80 L75 90 L60 90 L50 100 L40 90 L25 90 L15 80 L15 65 L5 55 L5 45 L15 35 L15 20 L25 10 L40 10 Z"
          fill="none"
          stroke="#14b8a6"
          strokeWidth="4"
        />
        <circle cx="50" cy="50" r="15" fill="none" stroke="#14b8a6" strokeWidth="4" />
      </svg>

      <svg className="absolute bottom-32 left-40 w-56 h-56 animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100">
        <path
          d="M50 0 L60 10 L75 10 L85 20 L85 35 L95 45 L95 55 L85 65 L85 80 L75 90 L60 90 L50 100 L40 90 L25 90 L15 80 L15 65 L5 55 L5 45 L15 35 L15 20 L25 10 L40 10 Z"
          fill="none"
          stroke="#2dd4bf"
          strokeWidth="4"
        />
        <circle cx="50" cy="50" r="15" fill="none" stroke="#2dd4bf" strokeWidth="4" />
      </svg>

      <svg className="absolute bottom-20 right-20 w-40 h-40 animate-[spin_6s_linear_infinite_reverse]" viewBox="0 0 100 100">
        <path
          d="M50 0 L60 10 L75 10 L85 20 L85 35 L95 45 L95 55 L85 65 L85 80 L75 90 L60 90 L50 100 L40 90 L25 90 L15 80 L15 65 L5 55 L5 45 L15 35 L15 20 L25 10 L40 10 Z"
          fill="none"
          stroke="#14b8a6"
          strokeWidth="4"
        />
        <circle cx="50" cy="50" r="15" fill="none" stroke="#14b8a6" strokeWidth="4" />
      </svg>

      <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 animate-[spin_15s_linear_infinite]" viewBox="0 0 100 100">
        <path
          d="M50 0 L60 10 L75 10 L85 20 L85 35 L95 45 L95 55 L85 65 L85 80 L75 90 L60 90 L50 100 L40 90 L25 90 L15 80 L15 65 L5 55 L5 45 L15 35 L15 20 L25 10 L40 10 Z"
          fill="none"
          stroke="#2dd4bf"
          strokeWidth="3"
        />
        <circle cx="50" cy="50" r="15" fill="none" stroke="#2dd4bf" strokeWidth="3" />
      </svg>
    </div>
  );
}

const ROLES = ["Student"];
const COURSES = ["BSIS", "BPED", "ACT"];

// Course configuration: years and sets
const COURSE_CONFIG: Record<string, Record<string, string[]>> = {
  ACT: {
    "1st Year": ["A", "B", "C", "D", "E", "F"],
    "2nd Year": ["A", "B", "C", "D", "E"],
  },
  BSIS: {
    "3rd Year": ["A", "B", "C"],
    "4th Year": ["A", "B"],
  },
  BPED: {
    "3rd Year": ["A", "B", "C"],
  },
};

// Eye Icon Components
function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [role, setRole] = useState("Student");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [set, setSet] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const isStudent = role === "Student";

  // Get available years based on selected course
  const availableYears = course ? Object.keys(COURSE_CONFIG[course]) : [];
  
  // Get available sets based on selected course and year
  const availableSets = course && year ? COURSE_CONFIG[course][year] : [];

  // Handle course change - reset year and set
  const handleCourseChange = (value: string) => {
    setCourse(value);
    setYear("");
    setSet("");
  };

  // Handle year change - reset set
  const handleYearChange = (value: string) => {
    setYear(value);
    setSet("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (isStudent) {
      if (!course) {
        setError("Please select a course");
        return;
      }

      if (!year) {
        setError("Please select a year level");
        return;
      }

      if (!set) {
        setError("Please select a set");
        return;
      }
    }

    setIsLoading(true);

    try {
      await register(email, password, fullName, studentId, role.toLowerCase(), course, year, set);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-900 relative overflow-hidden">
      <GearsBackground />
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-teal-800/50 to-teal-950/50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white p-8 rounded-2xl border border-teal-200 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 bg-clip-text text-transparent">
              Student Registration
            </h1>
            <p className="text-gray-600">Create your account to get started</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
                placeholder="Enter your full name"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Role <span className="text-rose-500">*</span>
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setCourse("");
                  setYear("");
                  setSet("");
                }}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 12px center`, backgroundRepeat: `no-repeat`, backgroundSize: `20px` }}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} className="bg-white">{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                {isStudent ? "Student ID" : "Staff ID"} (Optional)
              </label>
              <input
                id="studentId"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
                placeholder={`Enter your ${isStudent ? "student" : "staff"} ID`}
              />
            </div>

            {/* Course, Year, Set - Only for Students */}
            {isStudent && (
              <>
                <div>
                  <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
                    Course <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="course"
                    value={course}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 12px center`, backgroundRepeat: `no-repeat`, backgroundSize: `20px` }}
                  >
                    <option value="" className="bg-white">Select your course</option>
                    {COURSES.map((c) => (
                      <option key={c} value={c} className="bg-white">{c}</option>
                    ))}
                  </select>
                </div>

                {/* Year Level - Shows based on course selection */}
                {course && (
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                      Year Level <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="year"
                      value={year}
                      onChange={(e) => handleYearChange(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all appearance-none cursor-pointer"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 12px center`, backgroundRepeat: `no-repeat`, backgroundSize: `20px` }}
                    >
                      <option value="" className="bg-white">Select your year level</option>
                      {availableYears.map((y) => (
                        <option key={y} value={y} className="bg-white">{y}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Set - Shows based on year selection */}
                {course && year && (
                  <div>
                    <label htmlFor="set" className="block text-sm font-medium text-gray-700 mb-2">
                      Set <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="set"
                      value={set}
                      onChange={(e) => setSet(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all appearance-none cursor-pointer"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 12px center`, backgroundRepeat: `no-repeat`, backgroundSize: `20px` }}
                    >
                      <option value="" className="bg-white">Select your set</option>
                      {availableSets.map((s) => (
                        <option key={s} value={s} className="bg-white">Set {s}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all pr-12"
                  placeholder="Create a password (min 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all pr-12"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all shadow-[0_0_30px_rgba(20,184,166,0.3)]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link
                href="/login/student"
                className="text-teal-600 hover:text-teal-700 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-600 text-sm transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
