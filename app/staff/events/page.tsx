"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, addDoc, doc, getDoc, Timestamp } from "firebase/firestore";
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
  createdBy?: string;
}

export default function StaffEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scanningEvent, setScanningEvent] = useState<Event | null>(null);
  const [scanMessage, setScanMessage] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createMessage, setCreateMessage] = useState("");

  // Form state for creating event
  const [formData, setFormData] = useState({
    eventName: "",
    date: "",
    time: "",
    location: "",
    description: "",
  });

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

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const db = getFirebaseDb();
      await addDoc(collection(db, "events"), {
        ...formData,
        createdAt: Timestamp.now().toDate().toISOString(),
        latitude: 0,
        longitude: 0,
        radius: 50,
        createdBy: "staff",
      });

      setCreateMessage("Event created successfully!");
      setTimeout(() => setCreateMessage(""), 3000);
      
      // Reset form and close modal
      setFormData({
        eventName: "",
        date: "",
        time: "",
        location: "",
        description: "",
      });
      setShowCreateModal(false);
      
      // Refresh events list
      fetchEvents();
    } catch (err) {
      console.error("Error creating event:", err);
      setCreateMessage("Failed to create event. Please try again.");
    }
  };

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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Events</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Event
            </button>
          </div>

          {createMessage && (
            <div className={`mb-4 p-4 rounded-md ${createMessage.includes("successfully") ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
              {createMessage}
            </div>
          )}

          {/* Create Event Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Create New Event</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                    <input
                      type="text"
                      value={formData.eventName}
                      onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                      placeholder="Enter event name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                      placeholder="Enter event location"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      rows={3}
                      placeholder="Enter event description"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
                    >
                      Create Event
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

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
