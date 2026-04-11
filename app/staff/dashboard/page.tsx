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
  const [qrToken, setQrToken] = useState(() => Date.now().toString());

  // Generate new QR token
  const refreshQR = useCallback(() => {
    setQrToken(Date.now().toString());
    setTimeLeft(60);
  }, []);

  // Countdown timer
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

  const qrData = JSON.stringify({
    eventId: event.id,
    eventName: event.eventName,
    token: qrToken,
    exp: Date.now() + 60000, // 1 minute expiry
  });

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
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
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
            
            {/* Timer badge */}
            <div className="absolute -top-3 -right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">
              QR code refreshes in <span className="font-bold text-emerald-600">{formatTime(timeLeft)}</span>
            </p>
            <p className="text-xs text-gray-500">
              Show this to students for attendance
            </p>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={refreshQR}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
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
