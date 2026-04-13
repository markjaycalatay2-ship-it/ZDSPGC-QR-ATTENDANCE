"use client";

import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { QRCodeSVG } from "qrcode.react";

export const dynamic = "force-dynamic";

interface Event {
  id: string;
  eventName: string;
  date: string;
  timeIn?: string;
  timeOut?: string;
  time?: string; // For backward compatibility with old events
  timeInWindowEnd?: string;
  timeOutWindowEnd?: string;
  location: string;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  eventName: string;
  scannedAt: string;
  status: string;
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: string;
  color: "blue" | "emerald" | "purple";
}

function StatsCard({ title, value, icon, color }: StatsCardProps) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/30",
    emerald: "from-emerald-500 to-emerald-600 shadow-emerald-500/30",
    purple: "from-purple-500 to-purple-600 shadow-purple-500/30",
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center text-white text-2xl shadow-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

interface EventCardProps {
  event: Event;
}

function EventCard({ event }: EventCardProps) {
  const [showQR, setShowQR] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [qrData, setQrData] = useState(() => {
    const token = Date.now().toString();
    return JSON.stringify({
      eventId: event.id,
      eventName: event.eventName,
      token: token,
      exp: Date.now() + 60000,
    });
  });

  // Generate new QR data
  const refreshQR = useCallback(() => {
    const token = Date.now().toString();
    setQrData(JSON.stringify({
      eventId: event.id,
      eventName: event.eventName,
      token: token,
      exp: Date.now() + 60000,
    }));
    setTimeLeft(60);
  }, [event.id, event.eventName]);

  // Countdown timer
  useEffect(() => {
    if (!showQR) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          refreshQR();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showQR, refreshQR]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800">{event.eventName}</h2>
        <p className="text-sm text-gray-500">
          {(event.timeIn || event.time)} - {(event.timeOut || event.time)} • {event.location}
        </p>
        <div className="mt-2 text-xs text-gray-400">
          <p>Time In: {event.timeIn || event.time} (1hr window)</p>
          <p>Time Out: {event.timeOut || event.time} (1hr window)</p>
        </div>
      </div>

      {!showQR ? (
        <div className="flex flex-col items-center justify-center py-12">
          <button
            onClick={() => setShowQR(true)}
            className="px-12 py-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xl font-bold rounded-2xl shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-1 flex items-center gap-4"
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Show QR Code
          </button>
          <p className="text-base text-gray-500 mt-6 text-center max-w-xs">
            Click to display QR code for students to scan
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center py-4">
          <div className="relative">
            <div className="p-4 bg-white border-4 border-emerald-500 rounded-2xl shadow-inner">
              <QRCodeSVG value={qrData} size={320} level="H" />
            </div>
            
            {/* Timer badge */}
            <div className="absolute -top-3 -right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-base text-gray-600 mb-2">
              QR code refreshes in <span className="font-bold text-emerald-600">{formatTime(timeLeft)}</span>
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Show this to students for attendance
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={refreshQR}
              className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Now
            </button>
            <button
              onClick={() => setShowQR(false)}
              className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Hide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StaffDashboardPage() {
  const [todayEvents, setTodayEvents] = useState<Event[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAttendance: 0,
    activeEvents: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const db = getFirebaseDb();
        const today = new Date().toISOString().split('T')[0];
        
        console.log("Fetching events for date:", today);
        const eventsQuery = query(
          collection(db, "events"),
          where("date", "==", today),
          orderBy("createdAt", "desc")
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        const events: Event[] = [];
        eventsSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log("Event found:", doc.id, data.eventName, "Date:", data.date, "TimeIn:", data.timeIn, "TimeOut:", data.timeOut);
          events.push({ id: doc.id, ...data } as Event);
        });
        console.log("Total events found:", events.length);
        setTodayEvents(events);

        // Fetch total students
        const usersQuery = query(collection(db, "users"), where("role", "==", "student"));
        const usersSnapshot = await getDocs(usersQuery);
        const totalStudents = usersSnapshot.size;

        // Fetch total attendance
        const attendanceSnapshot = await getDocs(collection(db, "attendance"));
        const totalAttendance = attendanceSnapshot.size;

        // Set stats
        setStats({
          totalStudents,
          totalAttendance,
          activeEvents: events.length,
        });

        // Fetch recent attendance records
        const recentAttendanceQuery = query(
          collection(db, "attendance"),
          orderBy("scannedAt", "desc"),
          limit(10)
        );
        const recentSnapshot = await getDocs(recentAttendanceQuery);
        const recent: AttendanceRecord[] = [];
        recentSnapshot.forEach((doc) => {
          const data = doc.data();
          recent.push({
            id: doc.id,
            studentId: data.studentId || "N/A",
            studentName: data.studentName || "Unknown",
            eventName: data.eventName || "Unknown Event",
            scannedAt: data.scannedAt || new Date().toISOString(),
            status: data.status || "present",
          });
        });
        setRecentAttendance(recent);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <ProtectedRoute allowedRole="staff">
      <div className="flex min-h-screen bg-gray-100">
        <StaffSidebar />

        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-8">Staff Dashboard</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatsCard
              title="Total Students"
              value={stats.totalStudents}
              icon="👨‍🎓"
              color="blue"
            />
            <StatsCard
              title="Total Attendance"
              value={stats.totalAttendance}
              icon="✅"
              color="emerald"
            />
            <StatsCard
              title="Active Events"
              value={stats.activeEvents}
              icon="📅"
              color="purple"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading dashboard...</p>
            </div>
          ) : todayEvents.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Events with QR - Takes up 2 columns */}
              <div className="lg:col-span-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Today's Events</h2>
                <div className="grid grid-cols-1 gap-6">
                  {todayEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>

              {/* Recent Attendance - Takes up 1 column */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Recent Attendance</h2>
                    <p className="text-sm text-gray-500">Latest recorded attendance</p>
                  </div>
                  <div className="max-h-[600px] overflow-y-auto">
                    {recentAttendance.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {recentAttendance.map((record) => (
                          <div key={record.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <span className="text-emerald-600 font-semibold text-sm">
                                  {record.studentName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">
                                  {record.studentName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {record.eventName}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {new Date(record.scannedAt).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                record.status === 'present' 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : record.status === 'late'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {record.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-gray-500">No recent attendance records</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="p-4 bg-gray-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Events Today</h3>
              <p className="text-gray-500">There are no events scheduled for today.</p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
