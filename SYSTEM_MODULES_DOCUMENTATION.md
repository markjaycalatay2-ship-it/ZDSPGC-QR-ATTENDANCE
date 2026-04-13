# ZDSPGC QR ATTENDANCE SYSTEM - MODULE DOCUMENTATION

## TABLE OF CONTENTS
1. [Authentication Module](#1-authentication-module)
2. [Student Dashboard Module](#2-student-dashboard-module)
3. [Student QR Scanner Module](#3-student-qr-scanner-module)
4. [Student Attendance History Module](#4-student-attendance-history-module)
5. [Student Events Module](#5-student-events-module)
6. [Staff Dashboard Module](#6-staff-dashboard-module)
7. [Staff QR Code Display Module](#7-staff-qr-code-display-module)
8. [Staff Attendance Reports Module](#8-staff-attendance-reports-module)
9. [Staff Live Monitoring Module](#9-staff-live-monitoring-module)
10. [Staff Events Module](#10-staff-events-module)
11. [Admin Dashboard Module](#11-admin-dashboard-module)
12. [Admin User Management Module](#12-admin-user-management-module)
13. [Admin Event Management Module](#13-admin-event-management-module)
14. [Firebase Configuration Module](#14-firebase-configuration-module)
15. [Protected Route Module](#15-protected-route-module)

---

## 1. AUTHENTICATION MODULE

**File:** `contexts/AuthContext.tsx`

**Purpose:** Manages user authentication state, login/logout functionality, and role-based access control.

**Key Functions:**
- User login with email/password
- User registration with role assignment
- Session persistence
- Logout functionality

```typescript
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";

type UserRole = "admin" | "staff" | "student";

interface User {
  uid: string;
  email: string | null;
  role: UserRole;
  name: string;
  studentId?: string;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserRole, userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const db = getFirebaseDb();
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...userDoc.data(),
          } as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (
    email: string,
    password: string,
    role: UserRole,
    userData: Partial<User>
  ) => {
    const auth = getFirebaseAuth();
    const { user: firebaseUser } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const db = getFirebaseDb();
    await setDoc(doc(db, "users", firebaseUser.uid), {
      email,
      role,
      ...userData,
      createdAt: new Date().toISOString(),
    });
  };

  const logout = async () => {
    const auth = getFirebaseAuth();
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

---

## 2. STUDENT DASHBOARD MODULE

**File:** `app/student/dashboard/page.tsx`

**Purpose:** Displays student attendance statistics, today's event, and attendance status with scan button.

**Key Features:**
- Present/Late/Absent statistics cards
- Today's event display
- Attendance status badge
- QR scan button (hidden if already marked)

```typescript
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface Event {
  id: string;
  eventName: string;
  date: string;
  time: string;
  location: string;
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

        setAttendanceStats({ present, late, absent, total: present + late + absent });
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
            <span className="font-semibold">Present</span>
          </div>
        );
      case "late":
        return (
          <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full">
            <span className="font-semibold">Late</span>
          </div>
        );
      case "absent":
        return (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full">
            <span className="font-semibold">Absent</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-full">
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
                  <span className="text-sm font-medium text-gray-600">Present</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{attendanceStats.present}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Late</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{attendanceStats.late}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Absent</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{attendanceStats.absent}</p>
            </div>
          </div>

          {/* Today's Event & Status */}
          {todayEvent && (
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
              <h2 className="text-xl font-semibold mb-2">{todayEvent.eventName}</h2>
              <p className="text-gray-600">{todayEvent.time} at {todayEvent.location}</p>
              
              <div className="my-4">
                <p className="text-sm text-gray-500 mb-2">Your Attendance Status:</p>
                {getStatusBadge(attendanceStatus)}
              </div>

              {attendanceStatus === "not-marked" ? (
                <Link href="/student/scan" className="w-full py-3 px-4 bg-emerald-500 text-white font-semibold rounded-xl text-center block">
                  Scan QR Code to Mark Attendance
                </Link>
              ) : (
                <div className="bg-emerald-50 p-4 rounded-xl text-center">
                  <p className="text-emerald-700 font-semibold">Attendance already recorded</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
```

---

## 3. STUDENT QR SCANNER MODULE

**File:** `app/student/scan/page.tsx`

**Purpose:** Allows students to scan QR codes using device camera to mark attendance.

**Key Features:**
- Camera access for QR scanning
- QR code validation
- Attendance recording to Firestore
- Success/Error feedback

```typescript
"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { collection, addDoc, query, where, getDocs, Timestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function StudentScanPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      setSuccess(null);
      setScanning(true);

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await handleScan(decodedText);
        },
        (errorMessage) => {
          console.log(errorMessage);
        }
      );
    } catch (err) {
      setError("Failed to start camera. Please allow camera access.");
      setScanning(false);
    }
  };

  const handleScan = async (qrData: string) => {
    try {
      // Stop scanning
      if (scannerRef.current) {
        await scannerRef.current.stop();
        setScanning(false);
      }

      // Parse QR data
      const data = JSON.parse(qrData);
      const { eventId, eventName, token, exp } = data;

      // Check if QR code is expired
      if (Date.now() > exp) {
        setError("QR code has expired. Please ask staff to refresh.");
        return;
      }

      const db = getFirebaseDb();

      // Check if already marked attendance
      const existingQuery = query(
        collection(db, "attendance"),
        where("studentId", "==", user?.uid),
        where("eventId", "==", eventId),
        where("date", "==", new Date().toISOString().split('T')[0])
      );
      const existing = await getDocs(existingQuery);

      if (!existing.empty) {
        setError("You have already marked attendance for this event today.");
        return;
      }

      // Get student data
      const studentQuery = query(
        collection(db, "users"),
        where("uid", "==", user?.uid)
      );
      const studentDoc = await getDocs(studentQuery);
      const studentData = studentDoc.docs[0]?.data();

      // Record attendance
      await addDoc(collection(db, "attendance"), {
        studentId: user?.uid,
        studentName: studentData?.name || "Unknown",
        studentIdNumber: studentData?.studentId || "N/A",
        eventId: eventId,
        eventName: eventName,
        date: new Date().toISOString().split('T')[0],
        timestamp: Timestamp.now().toDate().toISOString(),
        status: "Present",
        qrToken: token,
      });

      setSuccess(`Attendance recorded for ${eventName}!`);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/student/dashboard");
      }, 2000);

    } catch (err) {
      console.error("Error processing QR code:", err);
      setError("Invalid QR code. Please try again.");
    }
  };

  return (
    <ProtectedRoute allowedRole="student">
      <div className="flex min-h-screen bg-gray-100">
        <StudentSidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-8">Scan QR Code</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-100 border border-emerald-400 text-emerald-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <div className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto">
            {!scanning ? (
              <div className="text-center">
                <p className="text-gray-600 mb-4">Point your camera at the QR code displayed by staff</p>
                <button
                  onClick={startScanning}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Start Camera
                </button>
              </div>
            ) : (
              <div>
                <div id="qr-reader" className="w-full"></div>
                <button
                  onClick={() => {
                    scannerRef.current?.stop();
                    setScanning(false);
                  }}
                  className="mt-4 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 w-full"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
```

---

## 4. STUDENT ATTENDANCE HISTORY MODULE

**File:** `app/student/attendance/page.tsx`

**Purpose:** Displays student's complete attendance history in a table format.

**Key Features:**
- List of all attended events
- Date and time of attendance
- Status (Present/Late/Absent)

```typescript
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { useAuth } from "@/contexts/AuthContext";

interface AttendanceRecord {
  id: string;
  eventName: string;
  date: string;
  timestamp: string;
  status: string;
}

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user) return;

      try {
        const db = getFirebaseDb();
        const attendanceQuery = query(
          collection(db, "attendance"),
          where("studentId", "==", user.uid),
          orderBy("timestamp", "desc")
        );
        
        const snapshot = await getDocs(attendanceQuery);
        const records = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AttendanceRecord[];

        setAttendance(records);
      } catch (err) {
        console.error("Error fetching attendance:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "present":
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">Present</span>;
      case "late":
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">Late</span>;
      case "absent":
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">Absent</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{status}</span>;
    }
  };

  return (
    <ProtectedRoute allowedRole="student">
      <div className="flex min-h-screen bg-gray-100">
        <StudentSidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-8">Attendance History</h1>

          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : attendance.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-gray-500">No attendance records found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendance.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4">{record.eventName}</td>
                      <td className="px-6 py-4">{record.date}</td>
                      <td className="px-6 py-4">
                        {new Date(record.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(record.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
```

---

## 5. STUDENT EVENTS MODULE

**File:** `app/student/events/page.tsx`

**Purpose:** Displays all upcoming and past events for students to view.

```typescript
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StudentSidebar } from "@/components/student/StudentSidebar";

interface Event {
  id: string;
  eventName: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

export default function StudentEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const db = getFirebaseDb();
        const eventsQuery = query(
          collection(db, "events"),
          orderBy("date", "desc")
        );
        
        const snapshot = await getDocs(eventsQuery);
        const eventsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Event[];

        setEvents(eventsList);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const isToday = (date: string) => {
    return date === new Date().toISOString().split('T')[0];
  };

  return (
    <ProtectedRoute allowedRole="student">
      <div className="flex min-h-screen bg-gray-100">
        <StudentSidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-8">Events</h1>

          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : events.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-gray-500">No events scheduled.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`bg-white p-6 rounded-lg shadow-md ${
                    isToday(event.date) ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {isToday(event.date) && (
                    <span className="inline-block px-3 py-1 bg-blue-500 text-white text-sm rounded-full mb-2">
                      Today
                    </span>
                  )}
                  <h3 className="text-lg font-semibold mb-2">{event.eventName}</h3>
                  <p className="text-gray-600 text-sm mb-1">{event.date}</p>
                  <p className="text-gray-600 text-sm mb-1">{event.time}</p>
                  <p className="text-gray-600 text-sm">{event.location}</p>
                  <p className="text-gray-500 text-sm mt-2">{event.description}</p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
```

---

## 6. STAFF DASHBOARD MODULE

**File:** `app/staff/dashboard/page.tsx`

**Purpose:** Displays today's events with QR code generation for attendance marking.

**Key Features:**
- Shows today's events
- Generates dynamic QR codes
- 1-minute auto-refresh timer
- Manual refresh button

```typescript
"use client";

import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { QRCodeSVG } from "qrcode.react";

export const dynamic = "force-dynamic";

interface Event {
  id: string;
  eventName: string;
  date: string;
  time: string;
  location: string;
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
        <p className="text-sm text-gray-500">{event.time} • {event.location}</p>
      </div>

      {!showQR ? (
        <div className="flex flex-col items-center py-8">
          <button
            onClick={() => setShowQR(true)}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-3"
          >
            Show QR Code
          </button>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Click to display QR code for students to scan
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="p-6 bg-white border-4 border-emerald-500 rounded-2xl shadow-inner">
              <QRCodeSVG value={qrData} size={280} level="H" />
            </div>
            <div className="absolute -top-3 -right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">
              QR code refreshes in <span className="font-bold text-emerald-600">{formatTime(timeLeft)}</span>
            </p>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={refreshQR}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              Refresh Now
            </button>
            <button
              onClick={() => setShowQR(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTodayEvents = async () => {
      try {
        const db = getFirebaseDb();
        const today = new Date().toISOString().split('T')[0];
        
        const eventsQuery = query(
          collection(db, "events"),
          where("date", "==", today)
        );
        const snapshot = await getDocs(eventsQuery);
        
        const events: Event[] = [];
        snapshot.forEach((doc) => {
          events.push({ id: doc.id, ...doc.data() } as Event);
        });
        
        setTodayEvents(events);
      } catch (err) {
        console.error("Error fetching today's events:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodayEvents();
  }, []);

  return (
    <ProtectedRoute allowedRole="staff">
      <div className="flex min-h-screen bg-gray-100">
        <StaffSidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-8">Staff Dashboard</h1>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading events...</p>
            </div>
          ) : todayEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {todayEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Events Today</h3>
              <p className="text-gray-500">There are no events scheduled for today.</p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
```

---

## 7. STAFF QR CODE DISPLAY MODULE

*Included in Staff Dashboard Module above (EventCard component)*

---

## 8. STAFF ATTENDANCE REPORTS MODULE

**File:** `app/staff/reports/page.tsx`

**Purpose:** View and filter attendance records with statistics.

**Key Features:**
- Filter by event and date
- View attendance statistics
- Auto-refresh every 3 seconds
- Display student names and IDs

---

## 9. STAFF LIVE MONITORING MODULE

**File:** `app/staff/monitoring/page.tsx`

**Purpose:** Real-time display of students scanning QR codes with sound notification.

**Key Features:**
- Live updates every 3 seconds
- Sound alert on new scan
- Shows latest scanned student
- Lists recent attendance records

---

## 10. STAFF EVENTS MODULE

**File:** `app/staff/events/page.tsx`

**Purpose:** View all events with their details.

---

## 11. ADMIN DASHBOARD MODULE

**File:** `app/admin/dashboard/page.tsx`

**Purpose:** Overview of system statistics and quick actions.

**Key Features:**
- Total students count
- Total staff count
- Total events count
- Total attendance records
- Quick action buttons

---

## 12. ADMIN USER MANAGEMENT MODULE

**File:** `app/admin/users/page.tsx`

**Purpose:** Manage all users (students and staff) in the system.

**Key Features:**
- Add new users
- Edit user details
- Delete users
- View all users
- Filter by role

---

## 13. ADMIN EVENT MANAGEMENT MODULE

**File:** `app/admin/events/page.tsx`

**Purpose:** Create, edit, and delete events.

**Key Features:**
- Add new events
- Set event date, time, location
- Edit event details
- Delete events
- View all events

---

## 14. FIREBASE CONFIGURATION MODULE

**File:** `lib/firebase.ts`

**Purpose:** Initialize Firebase services (Auth, Firestore, Storage).

```typescript
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

// Helper functions
export function getFirebaseAuth() {
  return auth;
}

export function getFirebaseDb() {
  return db;
}

export function getFirebaseStorage() {
  return storage;
}
```

---

## 15. PROTECTED ROUTE MODULE

**File:** `components/ProtectedRoute.tsx`

**Purpose:** Protect routes based on user authentication and role.

```typescript
"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

type UserRole = "admin" | "staff" | "student";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole: UserRole;
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to appropriate login page
        router.push(`/login/${allowedRole}`);
      } else if (user.role !== allowedRole) {
        // Redirect to correct dashboard based on role
        router.push(`/${user.role}/dashboard`);
      }
    }
  }, [user, loading, allowedRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== allowedRole) {
    return null;
  }

  return <>{children}</>;
}
```

---

## DATABASE COLLECTIONS

### 1. Users Collection
```
users/{userId}
- email: string
- role: "admin" | "staff" | "student"
- name: string
- studentId: string (for students)
- department: string
- createdAt: timestamp
```

### 2. Events Collection
```
events/{eventId}
- eventName: string
- date: string (YYYY-MM-DD)
- time: string
- location: string
- description: string
- createdBy: string (admin ID)
```

### 3. Attendance Collection
```
attendance/{attendanceId}
- studentId: string
- studentName: string
- studentIdNumber: string
- eventId: string
- eventName: string
- date: string (YYYY-MM-DD)
- timestamp: string (ISO)
- status: "Present" | "Late" | "Absent"
- qrToken: string
```

---

## TECHNOLOGY STACK

| Component | Technology |
|-----------|------------|
| **Framework** | Next.js 15.2.0 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | Firebase Firestore |
| **Authentication** | Firebase Auth |
| **QR Scanning** | html5-qrcode |
| **QR Generation** | qrcode.react |
| **Deployment** | Render |

---

## END OF DOCUMENTATION
