"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

type UserRole = "admin" | "staff" | "student";

interface AddUserFormProps {
  onUserAdded: () => void;
}

export function AddUserForm({ onUserAdded }: AddUserFormProps) {
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [course, setCourse] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const db = getFirebaseDb();
      await addDoc(collection(db, "users"), {
        fullName,
        studentId,
        course,
        role,
        createdAt: new Date().toISOString(),
      });

      setSuccess("User added successfully!");
      setFullName("");
      setStudentId("");
      setCourse("");
      setRole("student");
      onUserAdded();
    } catch (err) {
      setError("Failed to add user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <h2 className="text-lg font-semibold mb-4">Add New User</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
            Student ID
          </label>
          <input
            id="studentId"
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
            Course
          </label>
          <input
            id="course"
            type="text"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="student">Student</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Adding..." : "Add User"}
          </button>
        </div>
      </form>
    </div>
  );
}
