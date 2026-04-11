"use client";

import { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

interface User {
  id: string;
  fullName: string;
  studentId: string;
  course: string;
  year?: string;
  set?: string;
  role: string;
  createdAt?: string;
}

interface UsersTableProps {
  users: User[];
  onUserDeleted: () => void;
}

export function UsersTable({ users, onUserDeleted }: UsersTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

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

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  // Group users by course and year
  const groupUsers = (users: User[]) => {
    const grouped: Record<string, Record<string, User[]>> = {};
    const staffAndAdmin: User[] = [];

    users.forEach(user => {
      if (user.role === "student" && user.course) {
        if (!grouped[user.course]) {
          grouped[user.course] = {};
        }
        const year = user.year || "No Year";
        if (!grouped[user.course][year]) {
          grouped[user.course][year] = [];
        }
        grouped[user.course][year].push(user);
      } else {
        staffAndAdmin.push(user);
      }
    });

    return { grouped, staffAndAdmin };
  };

  const { grouped, staffAndAdmin } = groupUsers(users);

  // Sort courses and years
  const sortedCourses = Object.keys(grouped).sort();
  const yearOrder = ["1st Year", "2nd Year", "3rd Year", "4th Year", "No Year"];

  const getSortedYears = (years: string[]) => {
    return years.sort((a, b) => {
      const indexA = yearOrder.indexOf(a);
      const indexB = yearOrder.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
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

  // Course colors for easy recognition
  const getCourseColors = (course: string) => {
    switch (course) {
      case "ACT":
        return {
          header: "from-orange-500 to-orange-600",
          badge: "bg-orange-100 text-orange-800",
          icon: "text-orange-500"
        };
      case "BSIS":
        return {
          header: "from-purple-500 to-purple-600",
          badge: "bg-purple-100 text-purple-800",
          icon: "text-purple-500"
        };
      case "BPED":
        return {
          header: "from-teal-500 to-teal-600",
          badge: "bg-teal-100 text-teal-800",
          icon: "text-teal-500"
        };
      default:
        return {
          header: "from-blue-500 to-blue-600",
          badge: "bg-blue-100 text-blue-800",
          icon: "text-blue-500"
        };
    }
  };

  const renderUserTable = (userList: User[], showHeaders = true) => (
    <table className="w-full">
      {showHeaders && (
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Full Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Course/Set
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
      )}
      <tbody className="divide-y divide-gray-200">
        {userList.map((user) => (
          <tr key={user.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {user.fullName}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {user.studentId || "-"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {user.role === "student" ? (
                <span>
                  {user.course} {user.year && `- ${user.year}`} {user.set && `(Set ${user.set})`}
                </span>
              ) : (
                <span className="text-gray-400">-</span>
              )}
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
  );

  if (users.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
        <p className="text-gray-500">No users found. Add a user to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Staff and Admin Section */}
      {staffAndAdmin.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Staff & Admin ({staffAndAdmin.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            {renderUserTable(staffAndAdmin)}
          </div>
        </div>
      )}

      {/* Students by Course and Year */}
      {sortedCourses.map((course) => {
        const years = getSortedYears(Object.keys(grouped[course]));
        const courseColors = getCourseColors(course);
        
        return (
          <div key={course} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className={`bg-gradient-to-r ${courseColors.header} px-6 py-3`}>
              <h3 className="text-white font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {course} Students
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {years.map((year) => {
                const yearUsers = grouped[course][year];
                const groupKey = `${course}-${year}`;
                const isExpanded = expandedGroups[groupKey] !== false;
                
                return (
                  <div key={year} className="bg-gray-50/50">
                    <button
                      onClick={() => toggleGroup(groupKey)}
                      className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">{year}</span>
                        <span className={`${courseColors.badge} text-xs px-2 py-1 rounded-full`}>
                          {yearUsers.length} students
                        </span>
                      </div>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {isExpanded && (
                      <div className="overflow-x-auto bg-white">
                        {renderUserTable(yearUsers, false)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
