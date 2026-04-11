"use client";

import { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

interface User {
  id: string;
  fullName: string;
  studentId: string;
  course: string;
  role: string;
  createdAt?: string;
}

interface UsersTableProps {
  users: User[];
  onUserDeleted: () => void;
}

export function UsersTable({ users, onUserDeleted }: UsersTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    setDeletingId(userId);
    try {
      const db = getFirebaseDb();
      await deleteDoc(doc(db, "users", userId));
      onUserDeleted();
    } catch (err) {
      alert("Failed to delete user. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "staff":
        return "bg-blue-100 text-blue-800";
      case "student":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (users.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
        <p className="text-gray-500">No users found. Add a user to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Full Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.fullName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.studentId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.course}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => handleDelete(user.id)}
                    disabled={deletingId === user.id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === user.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
