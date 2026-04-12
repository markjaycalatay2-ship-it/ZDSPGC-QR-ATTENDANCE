"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import Link from "next/link";
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

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const db = getFirebaseDb();
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch today's events
        const eventsQuery = query(
          collection(db, "events"),
          where("date", "==", today)
        );
        const eventSnapshot = await getDocs(eventsQuery);
        
        let event: Event | null = null;
        if (!eventSnapshot.empty) {
          const docSnapshot = eventSnapshot.docs[0];
          event = { id: docSnapshot.id, ...docSnapshot.data() } as Event;
          setTodayEvent(event);
        }

        // Fetch student's attendance history
        const attendanceQuery = query(
          collection(db, "attendance"),
          where("studentId", "==", user.uid)
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);
        
        let present = 0;
        let late = 0;
        let absent = 0;
        let todayStatus = "not-marked";

        attendanceSnapshot.forEach((doc) => {
          const data = doc.data();
          const status = data.status || "Present";
          
          if (status === "Present") present++;
          else if (status === "Late") late++;
          else if (status === "Absent") absent++;

          // Check if attendance is for today's event
          if (event && data.eventId === event.id && data.date === today) {
            todayStatus = status.toLowerCase();
          }
        });

        setAttendanceStats({
          present,
          late,
          absent,
          total: present + late + absent,
        });
        setAttendanceStatus(todayStatus);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

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

  return (
    <ProtectedRoute allowedRole="student">
      <div className="flex min-h-screen bg-gray-100">
        <StudentSidebar />

        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-8">Student Dashboard</h1>

          {/* Attendance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-600">Present</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">{attendanceStats.present}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-600">Late</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">{attendanceStats.late}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-600">Absent</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">{attendanceStats.absent}</p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : todayEvent ? (
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Today's Event</h2>
                  <p className="text-gray-600">
                    {todayEvent.eventName} at {todayEvent.time}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Location: {todayEvent.location}
                  </p>
                </div>
              </div>

              {/* Attendance Status */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Your Attendance Status:</p>
                {getStatusBadge(attendanceStatus)}
              </div>

              <div className="flex flex-col gap-4">
                {attendanceStatus === "not-marked" ? (
                  <Link
                    href="/student/scan"
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 text-center"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      Scan QR Code to Mark Attendance
                    </span>
                  </Link>
                ) : (
                  <div className="bg-emerald-50 p-4 rounded-xl text-center">
                    <p className="text-emerald-700 font-semibold">
                      ✓ Attendance already recorded for today
                    </p>
                  </div>
                )}
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>How to mark attendance:</strong><br />
                    1. Find the staff member at the event<br />
                    2. Ask to see the event QR code<br />
                    3. Click "Scan QR Code" above<br />
                    4. Point your camera at the QR code
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-gray-500 text-lg">No event scheduled for today</p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
