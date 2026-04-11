"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { useAuth } from "@/contexts/AuthContext";

export const dynamic = "force-dynamic";

interface AttendanceRecord {
  id: string;
  eventName: string;
  eventId: string;
  date: string;
  timestamp: string;
  status: string;
  location?: string;
}

export default function StudentAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    presentCount: 0,
    absentCount: 0,
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user) return;

      try {
        const db = getFirebaseDb();

        // Fetch student data to get studentId
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const studentData = userDoc.data();

        // Fetch attendance records for this student
        const attendanceQuery = query(
          collection(db, "attendance"),
          where("studentId", "==", user.uid),
          orderBy("timestamp", "desc")
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);

        const attendanceList = attendanceSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AttendanceRecord[];

        setAttendance(attendanceList);

        // Calculate stats
        const present = attendanceList.filter((a) => a.status === "present").length;
        const absent = attendanceList.filter((a) => a.status === "absent").length;

        setStats({
          totalEvents: attendanceList.length,
          presentCount: present,
          absentCount: absent,
        });
      } catch (err) {
        console.error("Error fetching attendance:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ProtectedRoute allowedRole="student">
      <div className="flex min-h-screen bg-gray-100">
        <StudentSidebar />

        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-8">Attendance History</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg
                    className="h-5 w-5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  Total Events Attended
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {isLoading ? "..." : stats.totalEvents}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <svg
                    className="h-5 w-5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-600">Present</span>
              </div>
              <p className="text-3xl font-bold text-emerald-600">
                {isLoading ? "..." : stats.presentCount}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg
                    className="h-5 w-5 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-600">Absent</span>
              </div>
              <p className="text-3xl font-bold text-red-600">
                {isLoading ? "..." : stats.absentCount}
              </p>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Attendance Records ({attendance.length})
              </h2>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                Loading attendance records...
              </div>
            ) : attendance.length === 0 ? (
              <div className="p-8 text-center">
                <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <p className="text-gray-500">No attendance records found.</p>
                <p className="text-gray-400 text-sm mt-2">
                  Attend an event to see your records here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {attendance.map((record, index) => (
                      <tr
                        key={record.id}
                        className={`hover:bg-emerald-50/50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-emerald-100 rounded-lg">
                              <svg
                                className="h-4 w-4 text-emerald-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {record.eventName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatTime(record.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              record.status === "present"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {record.status || "Present"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
