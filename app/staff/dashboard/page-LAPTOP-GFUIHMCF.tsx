"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StatCard } from "@/components/admin/StatCard";
import { QRCodeSVG } from "qrcode.react";

export const dynamic = "force-dynamic";

interface Event {
  id: string;
  eventName: string;
  date: string;
  time: string;
  location: string;
}

export default function StaffDashboardPage() {
  const [stats, setStats] = useState({
    activeEvents: 0,
    todayAttendance: 0,
    totalAttendance: 0,
    upcomingEvents: 0,
  });
  const [todayEvents, setTodayEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const db = getFirebaseDb();
        const today = new Date().toISOString().split('T')[0];

        // Count all events
        const eventsSnapshot = await getDocs(collection(db, "events"));
        const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
        const activeEvents = events.length;

        // Count today's events (events happening today)
        const todaysEvents = events.filter(e => e.date === today);
        setTodayEvents(todaysEvents);

        // Count all attendance records
        const attendanceSnapshot = await getDocs(collection(db, "attendance"));
        const attendance = attendanceSnapshot.docs.map(doc => doc.data());
        const totalAttendance = attendance.length;

        // Count today's attendance
        const todayAttendance = attendance.filter(a => {
          const recordDate = a.timestamp ? new Date(a.timestamp).toISOString().split('T')[0] : null;
          return recordDate === today;
        }).length;

        setStats({
          activeEvents,
          todayAttendance,
          totalAttendance,
          upcomingEvents: todaysEvents.length,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <ProtectedRoute allowedRole="staff">
      <div className="flex min-h-screen bg-gray-100">
        <StaffSidebar />

        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-8">Dashboard Overview</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Active Events"
              value={isLoading ? "..." : stats.activeEvents.toString()}
              icon="events"
              color="purple"
              trend="All scheduled events"
            />
            <StatCard
              title="Today's Attendance"
              value={isLoading ? "..." : stats.todayAttendance.toString()}
              icon="attendance"
              color="green"
              trend="Recorded today"
            />
            <StatCard
              title="Total Attendance"
              value={isLoading ? "..." : stats.totalAttendance.toString()}
              icon="users"
              color="blue"
              trend="All time records"
            />
            <StatCard
              title="Events Today"
              value={isLoading ? "..." : stats.upcomingEvents.toString()}
              icon="events"
              color="orange"
              trend="Happening today"
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
                href="/staff/scan"
                className="group flex items-center gap-4 p-5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl text-white shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Scan QR Code</h3>
                  <p className="text-emerald-100 text-sm">Record attendance</p>
                </div>
                <svg className="h-5 w-5 ml-auto opacity-60 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              <a
                href="/staff/reports"
                className="group flex items-center gap-4 p-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">View Reports</h3>
                  <p className="text-blue-100 text-sm">Check attendance data</p>
                </div>
                <svg className="h-5 w-5 ml-auto opacity-60 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              <a
                href="/staff/events"
                className="group flex items-center gap-4 p-5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl text-white shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">View Events</h3>
                  <p className="text-purple-100 text-sm">See all events</p>
                </div>
                <svg className="h-5 w-5 ml-auto opacity-60 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Today's Event QR Codes */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Today&apos;s Event QR Codes
            </h2>
            <p className="text-gray-500 mb-4">Students can scan these QR codes to mark their attendance</p>
            
            {isLoading ? (
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
                <div className="animate-pulse h-48 bg-gray-200 rounded-lg"></div>
              </div>
            ) : todayEvents.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
                <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500">No events scheduled for today</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {todayEvents.map((event) => {
                  const qrData = JSON.stringify({
                    eventId: event.id,
                    eventName: event.eventName,
                  });
                  return (
                    <div key={event.id} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{event.eventName}</h3>
                          <p className="text-sm text-gray-500">{event.time} at {event.location}</p>
                        </div>
                      </div>
                      <div className="flex justify-center p-4 bg-gray-50 rounded-xl">
                        <QRCodeSVG value={qrData} size={180} level="H" />
                      </div>
                      <p className="text-center text-sm text-gray-500 mt-4">Show this to students</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
