"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StudentSidebar, GearsBackground } from "@/components/student/StudentSidebar";
import { collection, addDoc, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export const dynamic = "force-dynamic";

export default function StudentScanPage() {
  const [scanResult, setScanResult] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [studentData, setStudentData] = useState<any>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user) return;
      try {
        const db = getFirebaseDb();
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setStudentData(userDoc.data());
        }
      } catch (err) {
        console.error("Error fetching student data:", err);
      }
    };
    fetchStudentData();
  }, [user]);

  useEffect(() => {
    if (status === "scanning") {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
        false
      );

      scanner.render(
        async (decodedText) => {
          scanner.clear();
          setScanResult(decodedText);
          await processAttendance(decodedText);
        },
        () => {}
      );

      // Hide file scanning option
      setTimeout(() => {
        const fileInput = document.querySelector('#qr-reader input[type="file"]');
        if (fileInput) {
          fileInput.parentElement?.remove();
        }
      }, 100);

      return () => {
        scanner.clear().catch(() => {});
      };
    }
  }, [status]);

  const processAttendance = async (qrData: string) => {
    if (!studentData || !user) {
      setStatus("error");
      setMessage("Student data not found");
      return;
    }

    try {
      const db = getFirebaseDb();
      
      let eventData;
      try {
        eventData = JSON.parse(qrData);
      } catch {
        eventData = { eventId: qrData };
      }

      const { eventId, eventName } = eventData;

      if (!eventId) {
        setStatus("error");
        setMessage("Invalid QR code");
        return;
      }

      const eventDoc = await getDoc(doc(db, "events", eventId));
      if (!eventDoc.exists()) {
        setStatus("error");
        setMessage("Event not found");
        return;
      }

      const eventInfo = eventDoc.data();
      // Get today's date in local timezone (YYYY-MM-DD format)
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      if (eventInfo.date !== today) {
        setStatus("error");
        setMessage("This event is not scheduled for today");
        return;
      }

      // Check if already recorded
      const attendanceQuery = query(
        collection(db, "attendance"),
        where("studentId", "==", user.uid),
        where("eventId", "==", eventId),
        where("date", "==", today)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);

      if (!attendanceSnapshot.empty) {
        setStatus("error");
        setMessage("Attendance already recorded for this event today");
        return;
      }

      // Check time windows for late marking
      const scanNow = new Date();
      const scanTime = scanNow.getTime();
      let attendanceStatus: "present" | "late" = "present";
      let lateReason = "";

      // Get time windows from event
      const timeInWindowStart = eventInfo.timeInWindowStart ? new Date(eventInfo.timeInWindowStart).getTime() : null;
      const timeInWindowEnd = eventInfo.timeInWindowEnd ? new Date(eventInfo.timeInWindowEnd).getTime() : null;
      const timeOutWindowStart = eventInfo.timeOutWindowStart ? new Date(eventInfo.timeOutWindowStart).getTime() : null;
      const timeOutWindowEnd = eventInfo.timeOutWindowEnd ? new Date(eventInfo.timeOutWindowEnd).getTime() : null;
      
      // Fallback to timeIn/timeOut if window fields not available (backward compatibility)
      const timeInStart = timeInWindowStart || (eventInfo.timeIn ? new Date(`${today}T${eventInfo.timeIn}`).getTime() : null);
      const timeOutStart = timeOutWindowStart || (eventInfo.timeOut ? new Date(`${today}T${eventInfo.timeOut}`).getTime() : null);

      console.log("Scan time check:", {
        scanTime: new Date(scanTime).toISOString(),
        timeInStart: timeInStart ? new Date(timeInStart).toISOString() : null,
        timeInWindowEnd: timeInWindowEnd ? new Date(timeInWindowEnd).toISOString() : null,
        timeOutStart: timeOutStart ? new Date(timeOutStart).toISOString() : null,
        timeOutWindowEnd: timeOutWindowEnd ? new Date(timeOutWindowEnd).toISOString() : null,
      });

      if (timeInStart && timeOutStart && timeInWindowEnd && timeOutWindowEnd) {
        // Check if scanned during time-in window (timeIn to timeIn + 1hr)
        if (scanTime >= timeInStart && scanTime <= timeInWindowEnd) {
          attendanceStatus = "present";
          console.log("Marked as PRESENT - within time-in window");
        }
        // Check if scanned during time-out window (timeOut to timeOut + 1hr)
        else if (scanTime >= timeOutStart && scanTime <= timeOutWindowEnd) {
          attendanceStatus = "present";
          console.log("Marked as PRESENT - within time-out window");
        }
        // If scanned before time-in start
        else if (scanTime < timeInStart) {
          attendanceStatus = "late";
          lateReason = "Scanned before time-in window";
          console.log("Marked as LATE - before time-in window");
        }
        // If scanned after time-out window end
        else if (scanTime > timeOutWindowEnd) {
          attendanceStatus = "late";
          lateReason = "Scanned after time-out window ended";
          console.log("Marked as LATE - after time-out window");
        }
        // If scanned between timeIn window end and timeOut window start
        else {
          attendanceStatus = "late";
          lateReason = "Scanned outside allowed time windows";
          console.log("Marked as LATE - between windows");
        }
      } else {
        console.log("Time window data incomplete, defaulting to present");
      }

      // Record attendance
      await addDoc(collection(db, "attendance"), {
        studentId: user.uid,
        studentName: studentData.fullName,
        studentIdNumber: studentData.studentId,
        course: studentData.course || "Unknown",
        eventId,
        eventName: eventName || eventInfo.eventName,
        date: today,
        timestamp: new Date().toISOString(),
        status: attendanceStatus,
        lateReason: lateReason || null,
      });

      setStatus("success");
      if (attendanceStatus === "present") {
        setMessage(`Attendance recorded for ${eventInfo.eventName}!`);
      } else {
        setMessage(`Attendance recorded as LATE for ${eventInfo.eventName}. ${lateReason}`);
      }
    } catch (err) {
      console.error("Error:", err);
      setStatus("error");
      setMessage("Failed to record attendance");
    }
  };

  const resetScanner = () => {
    setStatus("scanning");
    setScanResult("");
    setMessage("");
  };

  return (
    <ProtectedRoute allowedRole="student">
      <div className="flex min-h-screen bg-teal-100 relative overflow-hidden">
        <GearsBackground />
        <StudentSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl font-bold mb-8">Scan Event QR Code</h1>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            {status === "idle" && (
              <div className="text-center py-12">
                <div className="p-4 bg-emerald-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <svg className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Scan</h3>
                <p className="text-gray-500 mb-6">Point your camera at the staff&apos;s event QR code</p>
                <button
                  onClick={() => setStatus("scanning")}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Start Scanning
                </button>
              </div>
            )}

            {status === "scanning" && (
              <div>
                <div className="text-center mb-4">
                  <p className="text-gray-600">Position the QR code in the camera view</p>
                </div>
                <div id="qr-reader" className="w-full max-w-md mx-auto"></div>
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setStatus("idle")}
                    className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="text-center py-12">
                <div className="p-4 bg-emerald-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <svg className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-emerald-600 mb-2">Success!</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={resetScanner}
                    className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Scan Another
                  </button>
                  <button
                    onClick={() => router.push("/student/dashboard")}
                    className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="text-center py-12">
                <div className="p-4 bg-red-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-red-600 mb-2">Error</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={resetScanner}
                    className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => router.push("/student/dashboard")}
                    className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How to Mark Attendance
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">1.</span>
                <span>Find the staff member at the event location</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">2.</span>
                <span>Ask to see the event QR code</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">3.</span>
                <span>Click "Start Scanning" and point camera at the QR code</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">4.</span>
                <span>Your attendance will be automatically recorded</span>
              </li>
            </ul>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
