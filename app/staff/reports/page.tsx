"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StaffSidebar } from "@/components/staff/StaffSidebar";

export const dynamic = "force-dynamic";

interface AttendanceRecord {
  id: string;
  studentName: string;
  studentId: string;
  eventName: string;
  eventId: string;
  date: string;
  timestamp: string;
  status: string;
}

interface Event {
  id: string;
  eventName: string;
}

export default function StaffReportsPage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPresent: 0,
    uniqueStudents: 0,
    byEvent: {} as Record<string, number>,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirebaseDb();

        // Fetch events
        const eventsSnapshot = await getDocs(collection(db, "events"));
        const eventsList = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          eventName: doc.data().eventName || "Unnamed Event",
        }));
        setEvents(eventsList);

        // Fetch attendance
        const attendanceSnapshot = await getDocs(
          query(collection(db, "attendance"), orderBy("timestamp", "desc"))
        );
        const attendanceList = attendanceSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AttendanceRecord[];
        setAttendance(attendanceList);

        // Calculate stats
        const totalPresent = attendanceList.length;
        const uniqueStudents = new Set(attendanceList.map(a => a.studentId)).size;
        const byEvent: Record<string, number> = {};
        attendanceList.forEach(a => {
          byEvent[a.eventName] = (byEvent[a.eventName] || 0) + 1;
        });

        setStats({ totalPresent, uniqueStudents, byEvent });
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter attendance
  const filteredAttendance = attendance.filter((record) => {
    const matchEvent = selectedEvent === "all" || record.eventId === selectedEvent;
    const matchDate = record.date === selectedDate;
    return matchEvent && matchDate;
  });

  const formatTime = (timestamp: string) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ProtectedRoute allowedRole="staff">
      <div className="flex min-h-screen bg-gray-100">
        <StaffSidebar />

        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-8">Attendance Reports</h1>

          {/* Filters */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Event
                </label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="all">All Events</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.eventName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-600">Total Present</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">{isLoading ? "..." : filteredAttendance.length}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-600">Unique Students</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {isLoading ? "..." : new Set(filteredAttendance.map(a => a.studentId)).size}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-600">Events Covered</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {isLoading ? "..." : new Set(filteredAttendance.map(a => a.eventId)).size}
              </p>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Attendance Records ({filteredAttendance.length})
              </h2>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading attendance data...</div>
            ) : filteredAttendance.length === 0 ? (
              <div className="p-8 text-center">
                <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-500">No attendance records found for selected filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Student
                      </th>
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
                    {filteredAttendance.map((record, index) => (
                      <tr key={record.id} className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-100 rounded-lg">
                              <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{record.studentName || "Unknown"}</p>
                              <p className="text-xs text-gray-500">{record.studentId || "N/A"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {record.eventName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {record.date || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatTime(record.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
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
