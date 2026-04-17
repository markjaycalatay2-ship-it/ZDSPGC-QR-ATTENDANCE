"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StudentSidebar, GearsBackground } from "@/components/student/StudentSidebar";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export const dynamic = "force-dynamic";

interface Event {
  id: string;
  eventName: string;
  date: string;
  timeIn?: string;
  timeOut?: string;
  time?: string;
  location: string;
}

interface AttendanceRecord {
  id: string;
  eventId: string;
  status: string;
  timestamp: string;
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [todayEvent, setTodayEvent] = useState<Event | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<string>("not-marked");
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    late: 0,
    absent: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [updateNotification, setUpdateNotification] = useState<string>("");

  useEffect(() => {
    if (!user?.uid) return;

    const db = getFirebaseDb();
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Real-time listener for attendance stats
    const attendanceQuery = query(
      collection(db, "attendance"),
      where("studentId", "==", user.uid)
    );

    const unsubscribeAttendance = onSnapshot(attendanceQuery, (snapshot) => {
      console.log("=== ATTENDANCE SNAPSHOT ===");
      console.log("Docs found:", snapshot.size);
      
      let presentCount = 0;
      let lateCount = 0;
      let absentCount = 0;

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const status = (data.status || "").toLowerCase();
        console.log("Doc:", doc.id, "Status:", status);

        if (status === "present") {
          presentCount++;
        } else if (status === "late") {
          lateCount++;
        } else if (status === "absent") {
          absentCount++;
        }
      });

      const newStats = {
        present: presentCount,
        late: lateCount,
        absent: absentCount,
        total: snapshot.size,
      };

      console.log("New stats:", newStats);

      // Only update notification if stats changed
      if (JSON.stringify(newStats) !== JSON.stringify(attendanceStats)) {
        setAttendanceStats(newStats);
        setLastUpdated(new Date().toLocaleTimeString());
        setUpdateNotification("Attendance stats updated!");
        setTimeout(() => setUpdateNotification(""), 3000);
      }

      setIsLoading(false);
    });

    // Load today's event
    const loadEvent = async () => {
      const eventQuery = query(
        collection(db, "events"),
        where("date", "==", today)
      );

      const eventSnapshot = await getDocs(eventQuery);
      if (!eventSnapshot.empty) {
        const docSnapshot = eventSnapshot.docs[0];
        setTodayEvent({ id: docSnapshot.id, ...docSnapshot.data() } as Event);
      }
    };

    loadEvent();

    return () => unsubscribeAttendance();
  }, [user?.uid]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return (
          <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold">Present</span>
          </div>
        );
      case "late":
        return (
          <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">Late</span>
          </div>
        );
      case "absent":
        return (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="font-semibold">Absent</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-full">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">Not Yet Marked</span>
          </div>
        );
    }
  };

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <ProtectedRoute allowedRole="student">
      <div className="flex min-h-screen bg-teal-100 relative overflow-hidden">
        <GearsBackground />
        <StudentSidebar />

        <main className="flex-1 p-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            {updateNotification && (
              <div className="mb-4 p-4 bg-emerald-100 border border-emerald-400 rounded-lg flex items-center gap-2 animate-pulse">
                <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-emerald-800 font-medium">{updateNotification}</span>
              </div>
            )}

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Dashboard</h1>
              <p className="text-gray-600">Welcome back! Track your attendance here.</p>
              {lastUpdated && (
                <p className="text-sm text-gray-500 mt-1">Last updated: {lastUpdated}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Present</span>
                  <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">{attendanceStats.present}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Late</span>
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">{attendanceStats.late}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Absent</span>
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">{attendanceStats.absent}</p>
              </div>
            </div>

            {todayEvent ? (
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Today's Event</h2>
                <div className="mb-6">
                  <p className="text-lg font-semibold text-gray-800">{todayEvent.eventName}</p>
                  <p className="text-gray-600">{todayEvent.date}</p>
                  <p className="text-gray-600">
                    {formatTime(todayEvent.timeIn || todayEvent.time)} - {formatTime(todayEvent.timeOut || todayEvent.time)}
                  </p>
                  <p className="text-gray-600">{todayEvent.location}</p>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-600 mb-2">Your Status:</p>
                  {getStatusBadge(attendanceStatus)}
                </div>

                <Link
                  href="/student/scan"
                  className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Scan QR Code
                </Link>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>How to mark attendance:</strong><br />
                    1. Find the staff member at the event<br />
                    2. Ask to see the event QR code<br />
                    3. Click "Scan QR Code" above<br />
                    4. Point your camera at the QR code
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <p className="text-gray-500 text-lg">No event scheduled for today</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
