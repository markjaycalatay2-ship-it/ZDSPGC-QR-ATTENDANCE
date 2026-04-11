"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StatCard } from "@/components/admin/StatCard";

export const dynamic = "force-dynamic";

export default function StaffDashboardPage() {
  return (
    <ProtectedRoute allowedRole="staff">
      <div className="flex min-h-screen bg-gray-100">
        <StaffSidebar />

        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-8">Staff Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              title="Active Events"
              value="0"
              color="purple"
            />
            <StatCard
              title="Total Attendance"
              value="0"
              color="green"
            />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
