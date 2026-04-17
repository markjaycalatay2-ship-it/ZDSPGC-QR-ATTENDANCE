"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StudentSidebar } from "@/components/student/StudentSidebar";

export const dynamic = "force-dynamic";

interface Event {
  id: string;
  eventName: string;
  date: string;
  timeIn?: string;
  timeOut?: string;
  time?: string; // For backward compatibility with old events
  location: string;
  description?: string;
}

export default function StudentEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "today" | "upcoming" | "past">("all");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const db = getFirebaseDb();
        const eventsSnapshot = await getDocs(
          query(collection(db, "events"), orderBy("date", "desc"))
        );
        const eventsList = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Event[];
        setEvents(eventsList);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const filteredEvents = events.filter((event) => {
    if (filter === "today") return event.date === today;
    if (filter === "upcoming") return event.date > today;
    if (filter === "past") return event.date < today;
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to format time with AM/PM
  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return 'N/A';
    // Convert 24h time (HH:mm) to 12h with AM/PM
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <ProtectedRoute allowedRole="student">
      <div className="flex min-h-screen bg-gray-100">
        <StudentSidebar />

        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-8">Events</h1>

          {/* Filter Tabs */}
          <div className="bg-white p-2 rounded-xl shadow-lg border border-gray-100 mb-6 inline-flex">
            {(["all", "today", "upcoming", "past"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  filter === f
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-emerald-200 rounded-full mb-4"></div>
                <div className="h-4 w-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
              <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No events found
              </h3>
              <p className="text-gray-500">
                {filter === "today"
                  ? "No events scheduled for today."
                  : filter === "upcoming"
                  ? "No upcoming events scheduled."
                  : filter === "past"
                  ? "No past events."
                  : "No events available."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const isToday = event.date === today;
                const isPast = event.date < today;

                return (
                  <div
                    key={event.id}
                    className={`bg-white rounded-2xl shadow-lg border overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 ${
                      isToday
                        ? "border-emerald-300 ring-2 ring-emerald-100"
                        : "border-gray-100"
                    }`}
                  >
                    {/* Header */}
                    <div
                      className={`px-6 py-4 ${
                        isToday
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                          : isPast
                          ? "bg-gradient-to-r from-gray-500 to-gray-600"
                          : "bg-gradient-to-r from-blue-500 to-blue-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold">
                          {event.eventName}
                        </h3>
                        {isToday && (
                          <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full">
                            Today
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-sm">{formatDate(event.date)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-sm">{formatTime(event.timeIn || event.time)} - {formatTime(event.timeOut || event.time)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                          </svg>
                          <span className="text-sm">{event.location}</span>
                        </div>
                      </div>

                      {event.description && (
                        <p className="mt-4 text-sm text-gray-500 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      {/* Action Button */}
                      {isToday && (
                        <a
                          href="/student/scan"
                          className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                            />
                          </svg>
                          Mark Attendance
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
