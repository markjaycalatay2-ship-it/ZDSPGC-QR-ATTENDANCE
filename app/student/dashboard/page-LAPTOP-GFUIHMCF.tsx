"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, getDoc, orderBy } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { useAuth } from "@/contexts/AuthContext";

export const dynamic = "force-dynamic";

interface Event {
  id: string;
  eventName: string;
  date: string;
  time: string;
  location: string;
}

interface AttendanceRecord {
  id: string;
  eventName: string;
  date: string;
  timestamp: string;
  status: string;
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [todayEvent, setTodayEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPresent: 0,
    totalAbsent: 0,
    totalEvents: 0,
    attendanceRate: 0,
  });
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [studentData, setStudentData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        const db = getFirebaseDb();
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch today's event
        const eventsQuery = query(
          collection(db, "events"),
          where("date", "==", today)
        );
        const snapshot = await getDocs(eventsQuery);
        
        if (!snapshot.empty) {
          const docSnapshot = snapshot.docs[0];
          const eventData = docSnapshot.data() as Omit<Event, "id">;
          setTodayEvent({ id: docSnapshot.id, ...eventData });
        }

        // Fetch student data
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setStudentData(userDoc.data());
        }

        // Fetch attendance records
        const attendanceQuery = query(
          collection(db, "attendance"),
          where("studentId", "==", user.uid),
          orderBy("timestamp", "desc")
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);
        const attendanceList = attendanceSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AttendanceRecord[];

        // Calculate stats
        const present = attendanceList.filter(a => a.status === "present").length;
        const absent = attendanceList.filter(a => a.status === "absent").length;
        const total = attendanceList.length;
        const rate = total > 0 ? Math.round((present / total) * 100) : 0;

        setStats({
          totalPresent: present,
          totalAbsent: absent,
          totalEvents: total,
          attendanceRate: rate,
        });

        // Get recent 5 records
        setRecentAttendance(attendanceList.slice(0, 5));
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <ProtectedRoute allowedRole="student">
      <div className="flex min-h-screen bg-gray-100">
        <StudentSidebar />

        <main className="flex-1 p-8">
          {/* Header with Welcome */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome back{studentData?.fullName ? `, ${studentData.fullName}` : ""}!
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Attendance Rate */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-600">Attendance Rate</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {isLoading ? "..." : `${stats.attendanceRate}%`}
              </p>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${stats.attendanceRate}%` }}
                ></div>
              </div>
            </div>

            {/* Total Present */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-600">Present</span>
              </div>
              <p className="text-3xl font-bold text-emerald-600">
                {isLoading ? "..." : stats.totalPresent}
              </p>
              <p className="text-xs text-gray-400 mt-1">Events attended</p>
            </div>

            {/* Total Absent */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-600">Absent</span>
              </div>
              <p className="text-3xl font-bold text-red-600">
                {isLoading ? "..." : stats.totalAbsent}
              </p>
              <p className="text-xs text-gray-400 mt-1">Events missed</p>
            </div>

            {/* Total Events */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-600">Total Events</span>
              </div>
              <p className="text-3xl font-bold text-purple-600">
                {isLoading ? "..." : stats.totalEvents}
              </p>
              <p className="text-xs text-gray-400 mt-1">All time</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h2>
              
              <div className="space-y-4">
                <a
                  href="/student/scan"
                  className="group flex items-center gap-4 p-5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl text-white shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="p-3 bg-white/20 rounded-lg">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Scan Event QR Code</h3>
                    <p className="text-emerald-100 text-sm">Mark your attendance</p>
                  </div>
                  <svg className="h-5 w-5 ml-auto opacity-60 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>

                <a
                  href="/student/events"
                  className="group flex items-center gap-4 p-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="p-3 bg-white/20 rounded-lg">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">View All Events</h3>
                    <p className="text-blue-100 text-sm">See upcoming and past events</p>
                  </div>
                  <svg className="h-5 w-5 ml-auto opacity-60 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>

                <a
                  href="/student/attendance"
                  className="group flex items-center gap-4 p-5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl text-white shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="p-3 bg-white/20 rounded-lg">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">View Attendance History</h3>
                    <p className="text-purple-100 text-sm">Check your attendance records</p>
                  </div>
                  <svg className="h-5 w-5 ml-auto opacity-60 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              {/* Today's Event Card */}
              <div className="mt-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Today&apos;s Event
                </h2>

                {isLoading ? (
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <div className="animate-pulse h-24 bg-gray-200 rounded-lg"></div>
                  </div>
                ) : todayEvent ? (
                  <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 border-l-4 border-l-emerald-500">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{todayEvent.eventName}</h3>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 mb-4">
                      <p className="flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {todayEvent.time}
                      </p>
                      <p className="flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {todayEvent.location}
                      </p>
                    </div>
                    <a
                      href="/student/scan"
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-semibold text-sm"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      Mark Attendance
                    </a>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center">
                    <div className="p-3 bg-gray-50 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">No event scheduled for today</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Attendance */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Recent Attendance
              </h2>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {isLoading ? (
                  <div className="p-6">
                    <div className="animate-pulse space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                      ))}
                    </div>
                  </div>
                ) : recentAttendance.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No attendance records yet</p>
                    <p className="text-gray-400 text-sm mt-2">Scan QR code at events to record attendance</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {recentAttendance.map((record, index) => (
                      <div 
                        key={record.id} 
                        className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            record.status === 'present' ? 'bg-emerald-100' : 'bg-red-100'
                          }`}>
                            <svg className={`h-4 w-4 ${
                              record.status === 'present' ? 'text-emerald-600' : 'text-red-600'
                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              {record.status === 'present' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              )}
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{record.eventName}</p>
                            <p className="text-xs text-gray-500">{formatDate(record.date)}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          record.status === 'present' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {record.status === 'present' ? 'Present' : 'Absent'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <a 
                    href="/student/attendance" 
                    className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    View All Attendance Records
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
