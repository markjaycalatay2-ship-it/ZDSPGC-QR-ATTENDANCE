"use client";

import { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { QRCodeModal } from "./QRCodeModal";

interface Event {
  id: string;
  eventName: string;
  date: string;
  time: string;
  location: string;
  latitude: number;
  longitude: number;
  radius: number;
  createdAt?: string;
}

interface EventsTableProps {
  events: Event[];
  onEventDeleted: () => void;
}

export function EventsTable({ events, onEventDeleted }: EventsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [qrEvent, setQrEvent] = useState<Event | null>(null);

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    setDeletingId(eventId);
    try {
      const db = getFirebaseDb();
      await deleteDoc(doc(db, "events", eventId));
      onEventDeleted();
    } catch (err) {
      alert("Failed to delete event. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (events.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
        <div className="p-4 bg-purple-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <svg className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No events found</h3>
        <p className="text-gray-500">Create an event to get started with attendance tracking.</p>
      </div>
    );
  }

  return (
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Radius
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                    {event.radius}m
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setQrEvent(event)}
                      className="group flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      QR
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      disabled={deletingId === event.id}
                      className="group flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {deletingId === event.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {qrEvent && (
        <QRCodeModal
          eventId={qrEvent.id}
          eventName={qrEvent.eventName}
          isOpen={!!qrEvent}
          onClose={() => setQrEvent(null)}
        />
      )}
    </div>
  );
}
