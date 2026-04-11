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
            <div
              className={`mb-4 p-4 rounded-md ${
                scanMessage.includes("successfully")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {scanMessage}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading events...</div>
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <p className="text-gray-500">No events found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {events.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {event.eventName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(event.date)} at {event.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => setScanningEvent(event)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Check Attendance
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
