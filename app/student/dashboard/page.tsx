"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/contexts/AuthContext";

export const dynamic = "force-dynamic";

interface Event {
  id: string;
  eventName: string;
  date: string;
  time: string;
  location: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [todayEvent, setTodayEvent] = useState<Event | null>(null);
  const [qrToken, setQrToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [studentData, setStudentData] = useState<any>(null);

  useEffect(() => {
    const fetchTodayEvent = async () => {
      try {
        const db = getFirebaseDb();
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch today's events
        const eventsQuery = query(
          collection(db, "events"),
          where("date", "==", today)
        );
        const snapshot = await getDocs(eventsQuery);
        
        if (!snapshot.empty) {
          const docSnapshot = snapshot.docs[0];
          const eventData = docSnapshot.data() as Omit<Event, "id">;
          setTodayEvent({ id: docSnapshot.id, ...eventData });
          
          // Fetch current token
          const tokenDoc = await getDoc(doc(db, "eventTokens", snapshot.docs[0].id));
          if (tokenDoc.exists()) {
            setQrToken(tokenDoc.data().token);
          }
        }

        // Fetch student data
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setStudentData(userDoc.data());
          }
        }
      } catch (err) {
        console.error("Error fetching today's event:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodayEvent();
  }, [user]);

  const qrData = todayEvent && studentData && qrToken
    ? JSON.stringify({
        eventId: todayEvent.id,
        studentId: studentData.studentId,
        token: qrToken,
      })
    : "";

  return (
    <ProtectedRoute allowedRole="student">
      <div className="flex min-h-screen bg-gray-100">
        <StudentSidebar />

        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-8">Student Dashboard</h1>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : todayEvent ? (
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
              <h2 className="text-xl font-semibold mb-2">Today's Event</h2>
              <p className="text-gray-600 mb-4">
                {todayEvent.eventName} at {todayEvent.time}
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Location: {todayEvent.location}
              </p>

              {qrData ? (
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <QRCodeSVG value={qrData} size={200} level="H" />
                  </div>
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Show this QR code to staff for attendance
                  </p>
                </div>
              ) : (
                <p className="text-center text-gray-500">QR code not available</p>
              )}
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
