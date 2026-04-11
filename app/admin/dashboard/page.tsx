"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { StatCard } from "@/components/admin/StatCard";

export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRole="admin">
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />

        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-8">Dashboard Overview</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Students"
              value="0"
              color="blue"
            />
            <StatCard
              title="Total Staff"
              value="0"
              color="green"
            />
            <StatCard
              title="Active Events"
              value="0"
              color="purple"
            />
            <StatCard
              title="Total Attendance"
              value="0"
              color="orange"
            />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
