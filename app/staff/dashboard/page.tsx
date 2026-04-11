"use client";

import { useEffect, useState } from "react";
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todayEvents.map((event) => {
                const qrData = JSON.stringify({
                  eventId: event.id,
                  eventName: event.eventName,
                });

                return (
                  <div key={event.id} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <div className="mb-4">
                      <h2 className="text-lg font-bold text-gray-800">{event.eventName}</h2>
                      <p className="text-sm text-gray-500">{event.time} • {event.location}</p>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-white border-2 border-emerald-200 rounded-xl">
                        <QRCodeSVG value={qrData} size={180} level="H" />
                      </div>
                      <p className="text-xs text-gray-500 mt-3 text-center">
                        Show this QR code to students for attendance
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="p-4 bg-gray-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Events Today</h3>
              <p className="text-gray-500">There are no events scheduled for today.</p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
