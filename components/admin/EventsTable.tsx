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
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
        <p className="text-gray-500">No events found. Create an event to get started.</p>
      </div>
    );
  }

  return (
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coordinates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Radius
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {event.latitude.toFixed(6)}, {event.longitude.toFixed(6)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {event.radius}m
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                  <button
                    onClick={() => setQrEvent(event)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View QR
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    disabled={deletingId === event.id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === event.id ? "Deleting..." : "Delete"}
                  </button>
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
