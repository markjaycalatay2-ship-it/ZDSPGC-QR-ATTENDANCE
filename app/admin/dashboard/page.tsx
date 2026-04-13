"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface DashboardStats {
  students: number;
  staff: number;
  events: number;
  attendance: number;
}

interface RecentActivity {
  id: string;
  type: string;
  name: string;
  timestamp: string;
  details: string;
}

// Stat Card Component with Icon
function StatCard({ title, value, icon, color, link }: {
  title: string;
  value: number;
  icon: string;
  color: string;
  link: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/30",
    emerald: "from-emerald-500 to-emerald-600 shadow-emerald-500/30",
    purple: "from-purple-500 to-purple-600 shadow-purple-500/30",
    orange: "from-orange-500 to-orange-600 shadow-orange-500/30",
  };

  const iconBgClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <Link href={link} className="group">
      <div className={`bg-gradient-to-br ${colorClasses[color]} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={`p-3 ${iconBgClasses[color]} rounded-xl bg-white/20`}>
            <span className="text-2xl">{icon}</span>
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm text-white/70 group-hover:text-white transition-colors">
          <span>View Details</span>
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

// Quick Action Button
function QuickAction({ title, icon, href, color }: {
  title: string;
  icon: string;
  href: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200",
    emerald: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200",
    purple: "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200",
    orange: "bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200",
  };

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 p-4 rounded-xl border-2 ${colorClasses[color]} transition-all duration-300 hover:shadow-lg`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-semibold">{title}</span>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    students: 0,
    staff: 0,
    events: 0,
    attendance: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const db = getFirebaseDb();

        // Fetch students count
        const studentsQuery = query(collection(db, "users"), where("role", "==", "student"));
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentsCount = studentsSnapshot.size;

        // Fetch staff count
        const staffQuery = query(collection(db, "users"), where("role", "==", "staff"));
        const staffSnapshot = await getDocs(staffQuery);
        const staffCount = staffSnapshot.size;

        // Fetch events count
        const eventsSnapshot = await getDocs(collection(db, "events"));
        const eventsCount = eventsSnapshot.size;

        // Fetch attendance count
        const attendanceSnapshot = await getDocs(collection(db, "attendance"));
        const attendanceCount = attendanceSnapshot.size;

        setStats({
          students: studentsCount,
          staff: staffCount,
          events: eventsCount,
          attendance: attendanceCount,
        });

        // Fetch recent attendance activity
        const recentQuery = query(
          collection(db, "attendance"),
          orderBy("timestamp", "desc"),
          limit(5)
        );
        const recentSnapshot = await getDocs(recentQuery);
        const activities: RecentActivity[] = [];
        
        recentSnapshot.forEach((doc) => {
          const data = doc.data();
          activities.push({
            id: doc.id,
            type: "Attendance",
            name: data.studentName || "Unknown",
            timestamp: data.timestamp || new Date().toISOString(),
            details: `Marked ${data.status} for ${data.eventName}`,
          });
        });
        
        setRecentActivity(activities);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ProtectedRoute allowedRole="admin">
      <div className="flex min-h-screen bg-slate-50">
        <AdminSidebar />

        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back! Here's what's happening in your system.</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Total Students"
                  value={stats.students}
                  icon="👨‍🎓"
                  color="blue"
                  link="/admin/users"
                />
                <StatCard
                  title="Total Staff"
                  value={stats.staff}
                  icon="👨‍💼"
                  color="emerald"
                  link="/admin/users"
                />
                <StatCard
                  title="Active Events"
                  value={stats.events}
                  icon="📅"
                  color="purple"
                  link="/admin/events"
                />
                <StatCard
                  title="Total Attendance"
                  value={stats.attendance}
                  icon="✅"
                  color="orange"
                  link="/admin/events"
                />
              </div>

              {/* Quick Actions */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <QuickAction
                    title="Add New User"
                    icon="➕"
                    href="/admin/users"
                    color="blue"
                  />
                  <QuickAction
                    title="Create Event"
                    icon="📅"
                    href="/admin/events"
                    color="emerald"
                  />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-xl font-bold text-slate-800">Recent Activity</h2>
                  <p className="text-slate-500 text-sm">Latest attendance records from students</p>
                </div>
                
                {recentActivity.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-4xl mb-4">📭</div>
                    <p className="text-slate-500">No recent activity found.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span className="text-emerald-600 text-lg">✓</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{activity.name}</p>
                            <p className="text-sm text-slate-500">{activity.details}</p>
                          </div>
                        </div>
                        <span className="text-sm text-slate-400">{formatTime(activity.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
