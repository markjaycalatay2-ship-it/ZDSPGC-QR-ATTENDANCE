"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

interface AddEventFormProps {
  onEventAdded: () => void;
}

export function AddEventForm({ onEventAdded }: AddEventFormProps) {
  const [eventName, setEventName] = useState("");
  const [date, setDate] = useState("");
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const db = getFirebaseDb();
      // Calculate time windows (1 hour duration for each)
      const timeInDate = new Date(`${date}T${timeIn}`);
      const timeOutDate = new Date(`${date}T${timeOut}`);
      const timeInWindowEnd = new Date(timeInDate.getTime() + 60 * 60 * 1000); // +1 hour
      const timeOutWindowEnd = new Date(timeOutDate.getTime() + 60 * 60 * 1000); // +1 hour

      await addDoc(collection(db, "events"), {
        eventName,
        date,
        timeIn,
        timeOut,
        timeInWindowEnd: timeInWindowEnd.toISOString(),
        timeOutWindowEnd: timeOutWindowEnd.toISOString(),
        location,
        latitude: 0,
        longitude: 0,
        radius: 50,
        createdAt: new Date().toISOString(),
      });

      setSuccess("Event created successfully!");
      setEventName("");
      setDate("");
      setTimeIn("");
      setTimeOut("");
      setLocation("");
      onEventAdded();
    } catch (err) {
      setError("Failed to create event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <h2 className="text-lg font-semibold mb-4">Create New Event</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3">
          <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-1">
            Event Name
          </label>
          <input
            id="eventName"
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="timeIn" className="block text-sm font-medium text-gray-700 mb-1">
            Time In <span className="text-xs text-gray-500">(Start time - 1hr window)</span>
          </label>
          <input
            id="timeIn"
            type="time"
            value={timeIn}
            onChange={(e) => setTimeIn(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="timeOut" className="block text-sm font-medium text-gray-700 mb-1">
            Time Out <span className="text-xs text-gray-500">(End time - 1hr window)</span>
          </label>
          <input
            id="timeOut"
            type="time"
            value={timeOut}
            onChange={(e) => setTimeOut(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-3">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-3">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Creating..." : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
}
