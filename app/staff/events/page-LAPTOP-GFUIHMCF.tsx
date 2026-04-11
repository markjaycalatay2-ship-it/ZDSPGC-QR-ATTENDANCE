"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, addDoc, doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { QRScanner } from "@/components/staff/QRScanner";

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

export default function StaffEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scanningEvent, setScanningEvent] = useState<Event | null>(null);
  const [scanMessage, setScanMessage] = useState("");

  const fetchEvents = async () => {
    try {
      const db = getFirebaseDb();
      const eventsQuery = query(collection(db, "events"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(eventsQuery);
      const eventsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[];
      setEvents(eventsData);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleScan = async (data: string) => {
    try {
      const parsed = JSON.parse(data);
      const { eventId, token } = parsed;

      if (!scanningEvent || eventId !== scanningEvent.id) {
        setScanMessage("Invalid QR code for this event");
        setTimeout(() => setScanMessage(""), 3000);
        return;
      }

      const db = getFirebaseDb();

      // Validate token against Firestore
      const tokenDoc = await getDoc(doc(db, "eventTokens", eventId));
      if (!tokenDoc.exists()) {
        setScanMessage("QR code expired");
        setTimeout(() => setScanMessage(""), 3000);
        return;
      }

      const tokenData = tokenDoc.data();
      if (tokenData.token !== token) {
        setScanMessage("QR code expired");
        setTimeout(() => setScanMessage(""), 3000);
        return;
      }

      // Check if token is expired (30 seconds validity)
      const expiresAt = new Date(tokenData.expiresAt).getTime();
      if (Date.now() > expiresAt) {
        setScanMessage("QR code expired");
        setTimeout(() => setScanMessage(""), 3000);
        return;
      }

      // Record attendance
      await addDoc(collection(db, "attendance"), {
        eventId: scanningEvent.id,
        eventName: scanningEvent.eventName,
        token,
        scannedAt: new Date().toISOString(),
      });

      setScanMessage("Attendance recorded successfully!");
      setScanningEvent(null);
      setTimeout(() => setScanMessage(""), 3000);
    } catch (err) {
      setScanMessage("Invalid QR code format");
      setTimeout(() => setScanMessage(""), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <ProtectedRoute allowedRole="staff">
      <div className="flex min-h-screen bg-gray-100">
        <StaffSidebar />

        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-8">Events</h1>

          {scanMessage && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              scanMessage.includes("successfully")
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}>
              <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {scanMessage.includes("successfully") ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              {scanMessage}
            </div>
          )}

          {isLoading ? (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-purple-200 rounded-full mb-4"></div>
                <div className="h-4 w-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
              <div className="p-4 bg-purple-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No events found</h3>
              <p className="text-gray-500">No events are currently scheduled.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Events List</h3>
                      <p className="text-white/80 text-sm">{events.length} event{events.length !== 1 ? 's' : ''} found</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Event Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Coordinates
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {events.map((event, index) => (
                      <tr key={event.id} className={`hover:bg-purple-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-purple-100 rounded-lg">
                              <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{event.eventName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {event.time}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {event.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono bg-gray-50/50">
                          {event.latitude.toFixed(6)}, {event.longitude.toFixed(6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => setScanningEvent(event)}
                            className="group flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                            Scan QR
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {scanningEvent && (
            <QRScanner
              onScan={handleScan}
              onClose={() => setScanningEvent(null)}
            />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
