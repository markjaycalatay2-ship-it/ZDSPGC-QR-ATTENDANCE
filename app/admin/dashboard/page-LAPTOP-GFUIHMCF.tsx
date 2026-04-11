"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { StatCard } from "@/components/admin/StatCard";

export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    students: 0,
    staff: 0,
    events: 0,
    attendance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const db = getFirebaseDb();
        
        // Count students
        const usersSnapshot = await getDocs(collection(db, "users"));
        const users = usersSnapshot.docs.map(doc => doc.data());
        const students = users.filter(u => u.role === "student").length;
        const staff = users.filter(u => u.role === "staff").length;
        
        // Count events
        const eventsSnapshot = await getDocs(collection(db, "events"));
        const events = eventsSnapshot.size;
        
        // Count attendance
        const attendanceSnapshot = await getDocs(collection(db, "attendance"));
        const attendance = attendanceSnapshot.size;
        
        setStats({ students, staff, events, attendance });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <ProtectedRoute allowedRole="admin">
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />

        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-8">Dashboard Overview</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Students"
              value={isLoading ? "..." : stats.students.toString()}
              icon="users"
              color="blue"
              trend="Registered students"
            />
            <StatCard
              title="Total Staff"
              value={isLoading ? "..." : stats.staff.toString()}
              icon="staff"
              color="green"
              trend="Staff members"
            />
            <StatCard
              title="Active Events"
              value={isLoading ? "..." : stats.events.toString()}
              icon="events"
              color="purple"
              trend="Upcoming events"
            />
            <StatCard
              title="Total Attendance"
              value={isLoading ? "..." : stats.attendance.toString()}
              icon="attendance"
              color="orange"
              trend="Records tracked"
            />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/admin/events"
                className="group flex items-center gap-4 p-5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl text-white shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Create Event</h3>
                  <p className="text-purple-100 text-sm">Add new attendance event</p>
                </div>
                <svg className="h-5 w-5 ml-auto opacity-60 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              <a
                href="/admin/users"
                className="group flex items-center gap-4 p-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Add User</h3>
                  <p className="text-blue-100 text-sm">Register new student/staff</p>
                </div>
                <svg className="h-5 w-5 ml-auto opacity-60 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              <a
                href="/admin/monitoring"
                className="group flex items-center gap-4 p-5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl text-white shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">View Reports</h3>
                  <p className="text-emerald-100 text-sm">Check attendance reports</p>
                </div>
                <svg className="h-5 w-5 ml-auto opacity-60 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
