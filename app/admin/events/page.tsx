"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AddEventForm } from "@/components/admin/AddEventForm";
import { EventsTable } from "@/components/admin/EventsTable";

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
  createdAt?: string;
}

export default function EventsManagementPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <ProtectedRoute allowedRole="admin">
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />

        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-8">Manage Events</h1>

          <AddEventForm onEventAdded={fetchEvents} />

          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading events...</div>
            </div>
          ) : (
            <EventsTable events={events} onEventDeleted={fetchEvents} />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
