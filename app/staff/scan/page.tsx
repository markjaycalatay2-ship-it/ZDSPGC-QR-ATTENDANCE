"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { collection, addDoc, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export default function StaffScanPage() {
  const [scanResult, setScanResult] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [events, setEvents] = useState<{ id: string; eventName: string }[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const router = useRouter();

  // Fetch available events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const db = getFirebaseDb();
        const eventsSnapshot = await getDocs(collection(db, "events"));
        const eventsList = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          eventName: doc.data().eventName || "Unnamed Event",
        }));
        setEvents(eventsList);
        if (eventsList.length > 0) {
          setSelectedEvent(eventsList[0].id);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    fetchEvents();
  }, []);

  // Initialize QR scanner
  useEffect(() => {
    if (status === "scanning") {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        false
      );

      scanner.render(
        async (decodedText) => {
          scanner.clear();
          setScanResult(decodedText);
          await processAttendance(decodedText);
        },
        (err) => {
          // Silent error - scanner continues trying
        }
      );

      return () => {
        scanner.clear().catch(() => {});
      };
    }
  }, [status]);

  const processAttendance = async (qrData: string) => {
    if (!selectedEvent) {
      setStatus("error");
      setMessage("Please select an event first");
      return;
    }

    try {
      const db = getFirebaseDb();
      
      // QR data should contain student info (studentId or userId)
      const studentId = qrData;

      // Check if student exists
      const usersQuery = query(collection(db, "users"), where("studentId", "==", studentId));
      const userSnapshot = await getDocs(usersQuery);

      if (userSnapshot.empty) {
        // Try searching by user ID
        const userDoc = await getDoc(doc(db, "users", studentId));
        if (!userDoc.exists()) {
          setStatus("error");
          setMessage("Student not found");
          return;
        }
      }

      const studentData = userSnapshot.docs[0]?.data() || userSnapshot.docs[0]?.data();
      const studentName = studentData?.fullName || "Unknown";

      // Check if already recorded for this event today
      const today = new Date().toISOString().split('T')[0];
      const attendanceQuery = query(
        collection(db, "attendance"),
        where("studentId", "==", studentId),
        where("eventId", "==", selectedEvent),
        where("date", "==", today)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);

      if (!attendanceSnapshot.empty) {
        setStatus("error");
        setMessage(`${studentName} already checked in today`);
        return;
      }

      // Record attendance
      await addDoc(collection(db, "attendance"), {
        studentId,
        studentName,
        eventId: selectedEvent,
        eventName: events.find(e => e.id === selectedEvent)?.eventName || "",
        date: today,
        timestamp: new Date().toISOString(),
        status: "present",
      });

      setStatus("success");
      setMessage(`${studentName} marked present!`);
    } catch (err) {
      console.error("Error processing attendance:", err);
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
    <ProtectedRoute allowedRole="staff">
      <div className="flex min-h-screen bg-gray-100">
        <StaffSidebar />

        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-8">QR Code Scanner</h1>

          {/* Event Selection */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Event
            </label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.eventName}
                </option>
              ))}
            </select>
          </div>

          {/* Scanner Container */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6">
            {status === "idle" && (
              <div className="text-center py-12">
                <div className="p-4 bg-emerald-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <svg className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Scan</h3>
                <p className="text-gray-500 mb-6">Click below to start scanning student QR codes</p>
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
                  <p className="text-gray-600">Position the student's QR code in the camera view</p>
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
                    onClick={() => router.push("/staff/dashboard")}
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
                    onClick={() => router.push("/staff/dashboard")}
                    className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How to Scan
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">1.</span>
                <span>Select the event from the dropdown above</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">2.</span>
                <span>Click "Start Scanning" to open the camera</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">3.</span>
                <span>Position the student's QR code in the camera view</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">4.</span>
                <span>The attendance will be automatically recorded</span>
              </li>
            </ul>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
