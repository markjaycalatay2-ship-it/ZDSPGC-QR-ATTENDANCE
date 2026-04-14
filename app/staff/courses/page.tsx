"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, onSnapshot } from "firebase/firestore";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { ChevronDown, Users, GraduationCap, BookOpen } from "lucide-react";

interface Student {
  id: string;
  fullName: string;
  studentId: string;
  course: string;
  email: string;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  eventId: string;
  eventName: string;
  status: "present" | "late" | "absent" | "attended";
  timestamp: string;
  scanned: boolean;
}

interface Event {
  id: string;
  eventName: string;
  date: string;
  timeIn?: string;
  timeOut?: string;
  location: string;
}

const COURSES = ["ACT", "BSIS", "BPED"];

export default function CourseAttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attendedCount, setAttendedCount] = useState(0);

  // Fetch all students
  useEffect(() => {
    const fetchStudents = async () => {
      const studentsQuery = query(
        collection(db, "users"),
        where("role", "in", ["Student", "student"])
      );
      const snapshot = await getDocs(studentsQuery);
      const studentsData: Student[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        studentsData.push({
          id: doc.id,
          fullName: data.fullName || data.name || "Unknown",
          studentId: data.studentId || data.idNumber || "N/A",
          course: data.course || "N/A",
          email: data.email || "",
        });
      });
      setStudents(studentsData);
    };

    fetchStudents();
  }, []);

  // Fetch active events
  useEffect(() => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    
    const eventsQuery = query(
      collection(db, "events"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
      const eventsData: Event[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        eventsData.push({
          id: doc.id,
          eventName: data.eventName || "Unnamed Event",
          date: data.date || today,
          timeIn: data.timeIn || data.time,
          timeOut: data.timeOut || data.time,
          location: data.location || "Unknown",
        });
      });
      setEvents(eventsData);
      if (eventsData.length > 0 && !selectedEvent) {
        setSelectedEvent(eventsData[0].id);
      }
    });

    return () => unsubscribe();
  }, [selectedEvent]);

  // Fetch attendance records
  useEffect(() => {
    if (!selectedEvent) return;

    const attendanceQuery = query(
      collection(db, "attendance"),
      where("eventId", "==", selectedEvent),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(attendanceQuery, (snapshot) => {
      const attendanceData: AttendanceRecord[] = [];
      let attended = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const record: AttendanceRecord = {
          id: doc.id,
          studentId: data.studentId || "",
          studentName: data.studentName || "Unknown",
          eventId: data.eventId || selectedEvent,
          eventName: data.eventName || "",
          status: data.status || "absent",
          timestamp: data.timestamp || new Date().toISOString(),
          scanned: true,
        };
        attendanceData.push(record);
        if (data.scanned || data.status === "present" || data.status === "late") {
          attended++;
        }
      });
      
      setAttendance(attendanceData);
      setAttendedCount(attended);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedEvent]);

  // Filter students by selected course
  const filteredStudents = selectedCourse
    ? students.filter((s) => s.course.toUpperCase() === selectedCourse.toUpperCase())
    : students;

  // Get attendance status for a student
  const getStudentAttendanceStatus = (studentId: string): AttendanceRecord | undefined => {
    return attendance.find((a) => a.studentId === studentId);
  };

  // Get status display
  const getStatusDisplay = (status: string, scanned: boolean) => {
    if (scanned || status === "present" || status === "late" || status === "attended") {
      return { label: "Attended", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
    }
    if (status === "absent") {
      return { label: "Absent", color: "bg-red-100 text-red-700 border-red-200" };
    }
    return { label: "Not Scanned", color: "bg-gray-100 text-gray-600 border-gray-200" };
  };

  return (
    <ProtectedRoute allowedRole="staff">
      <div className="flex min-h-screen bg-gray-50">
        <StaffSidebar />

        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Course Attendance</h1>
            <p className="text-gray-500 mb-8">View attendance by course and mark students as attended</p>

            {/* Event Selection */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Active Event
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">-- Select an Event --</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.eventName} ({event.date} - {event.location})
                  </option>
                ))}
              </select>
            </div>

            {/* All Courses Button */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="relative">
                <button
                  onClick={() => setShowCourseDropdown(!showCourseDropdown)}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-6 w-6" />
                    <span className="text-lg font-semibold">
                      {selectedCourse ? `${selectedCourse} Students` : "All Courses"}
                    </span>
                  </div>
                  <ChevronDown className={`h-5 w-5 transition-transform ${showCourseDropdown ? "rotate-180" : ""}`} />
                </button>

                {showCourseDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-20">
                    <button
                      onClick={() => {
                        setSelectedCourse("");
                        setShowCourseDropdown(false);
                      }}
                      className={`w-full p-4 text-left hover:bg-purple-50 transition-colors flex items-center gap-3 ${!selectedCourse ? "bg-purple-50 text-purple-700" : "text-gray-700"}`}
                    >
                      <GraduationCap className="h-5 w-5" />
                      <span className="font-medium">All Courses</span>
                    </button>
                    {COURSES.map((course) => (
                      <button
                        key={course}
                        onClick={() => {
                          setSelectedCourse(course);
                          setShowCourseDropdown(false);
                        }}
                        className={`w-full p-4 text-left hover:bg-purple-50 transition-colors flex items-center gap-3 border-t border-gray-100 ${selectedCourse === course ? "bg-purple-50 text-purple-700" : "text-gray-700"}`}
                      >
                        <Users className="h-5 w-5" />
                        <span className="font-medium">{course}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-700">{filteredStudents.length}</p>
                  <p className="text-sm text-purple-600">Total Students</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-emerald-700">{attendedCount}</p>
                  <p className="text-sm text-emerald-600">Attended</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-700">{filteredStudents.length - attendedCount}</p>
                  <p className="text-sm text-red-600">Absent/Not Scanned</p>
                </div>
              </div>
            </div>

            {/* Student List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedCourse ? `${selectedCourse} Students` : "All Students"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedEvent 
                    ? `Attendance for: ${events.find(e => e.id === selectedEvent)?.eventName || "Selected Event"}`
                    : "Select an event to view attendance"
                  }
                </p>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading students...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-4xl mb-4">👥</div>
                  <p className="text-gray-500">
                    {selectedCourse 
                      ? `No students found in ${selectedCourse} course`
                      : "No students found"
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredStudents.map((student) => {
                    const attendanceRecord = getStudentAttendanceStatus(student.id);
                    const status = getStatusDisplay(
                      attendanceRecord?.status || "",
                      attendanceRecord?.scanned || false
                    );

                    return (
                      <div
                        key={student.id}
                        className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                            <span className="font-bold text-purple-700">
                              {student.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{student.fullName}</p>
                            <p className="text-sm text-gray-500">ID: {student.studentId}</p>
                            <p className="text-xs text-gray-400">{student.course}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {attendanceRecord && (
                            <p className="text-xs text-gray-400">
                              {new Date(attendanceRecord.timestamp).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          )}
                          <span className={`px-4 py-2 text-sm font-medium rounded-full border ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
