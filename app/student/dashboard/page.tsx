"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
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
  latitude: number;
  longitude: number;
  radius: number;
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [todayEvent, setTodayEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          
        }
      } catch (err) {
        console.error("Error fetching today's event:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodayEvent();
  }, [user]);


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

              <div className="flex flex-col gap-4">
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
