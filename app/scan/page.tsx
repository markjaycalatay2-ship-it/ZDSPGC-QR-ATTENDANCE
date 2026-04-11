"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { doc, getDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

export const dynamic = "force-dynamic";

interface Event {
  id: string;
  eventName: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export default function ScanPage() {
  const [studentId, setStudentId] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<{ eventId: string; token: string } | null>(null);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [eventData, setEventData] = useState<Event | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const deviceIdRef = useRef<string>("");

  // Generate or retrieve device ID
  useEffect(() => {
    let storedDeviceId = localStorage.getItem("attendance_device_id");
    if (!storedDeviceId) {
      storedDeviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem("attendance_device_id", storedDeviceId);
    }
    deviceIdRef.current = storedDeviceId;
  }, []);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isScanning) {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        false
      );

      const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lng2 - lng1) * Math.PI) / 180;

        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
      };

      const getUserLocation = (): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser"));
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            (err) => {
              reject(new Error("Unable to retrieve your location. Please enable location permissions."));
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        });
      };

      const handleScan = async (decodedText: string) => {
        setScanResult(decodedText);
        setIsScanning(false);
        setIsValidating(true);
        setLocationError("");
        setError("");

        try {
          const parsed = JSON.parse(decodedText);
          if (!parsed.eventId || !parsed.token) {
            setError("Invalid QR code format");
            setIsValidating(false);
            return;
          }

          // Validate QR token expiration (valid for 60 seconds)
          const tokenParts = parsed.token.split("_");
          if (tokenParts.length >= 2) {
            const tokenTimestamp = parseInt(tokenParts[1], 10);
            const now = Date.now();
            const age = now - tokenTimestamp;
            
            // Token expires after 60 seconds
            if (age > 60000) {
              setError("QR code expired. Please scan again");
              setIsValidating(false);
              return;
            }
          }

          setParsedData({
            eventId: parsed.eventId,
            token: parsed.token,
          });

          // Get user location
          const location = await getUserLocation();
          setUserLocation(location);

          // Fetch event details from Firestore
          const db = getFirebaseDb();
          const eventDoc = await getDoc(doc(db, "events", parsed.eventId));

          if (!eventDoc.exists()) {
            setError("Event not found");
            setIsValidating(false);
            return;
          }

          const eventInfo = eventDoc.data() as Event;
          setEventData(eventInfo);

          // Calculate distance from event location
          const distance = calculateDistance(
            location.lat,
            location.lng,
            eventInfo.latitude,
            eventInfo.longitude
          );

          // Validate against allowed radius
          if (distance > eventInfo.radius) {
            setLocationError("You must be at the event location");
            setIsValidating(false);
            return;
          }

          // Check for duplicate attendance
          const attendanceQuery = query(
            collection(db, "attendance"),
            where("studentId", "==", studentId),
            where("eventId", "==", parsed.eventId)
          );
          const existingAttendance = await getDocs(attendanceQuery);

          if (!existingAttendance.empty) {
            setError("You already attended this event");
            setIsValidating(false);
            return;
          }

          // Check for device/session validation - prevent multiple devices with same studentId
          const deviceQuery = query(
            collection(db, "attendance"),
            where("studentId", "==", studentId),
            where("deviceId", "!=", deviceIdRef.current)
          );
          const otherDeviceAttendance = await getDocs(deviceQuery);

          if (!otherDeviceAttendance.empty) {
            setError("This Student ID is already being used on another device");
            setIsValidating(false);
            return;
          }

          // Location validated - record attendance
          await addDoc(collection(db, "attendance"), {
            studentId,
            eventId: parsed.eventId,
            eventName: eventInfo.eventName,
            token: parsed.token,
            userLocation: { lat: location.lat, lng: location.lng },
            deviceId: deviceIdRef.current,
            scannedAt: new Date().toISOString(),
          });

          setIsValidating(false);
        } catch (err: any) {
          setError(err.message || "Failed to process scan");
          setIsValidating(false);
        }
      };

      scanner.render(
        handleScan,
        (err) => {
          // Silent error - scanner continues trying
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [isScanning]);

  const startScanning = () => {
    if (!studentId.trim()) {
      setError("Please enter a Student ID");
      return;
    }
    setError("");
    setIsScanning(true);
    setScanResult(null);
    setParsedData(null);
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const resetScanner = () => {
    setScanResult(null);
    setParsedData(null);
    setError("");
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Attendance Scanner</h1>

        {!isScanning && !scanResult && (
          <div className="space-y-4">
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                Student ID
              </label>
              <input
                id="studentId"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter Student ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              onClick={startScanning}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Start Camera Scanner
            </button>
          </div>
        )}

        {isScanning && (
          <div className="space-y-4">
            <p className="text-center text-gray-600">
              Scanning as: <span className="font-semibold">{studentId}</span>
            </p>
            <div id="qr-reader" className="w-full"></div>
            <button
              onClick={stopScanning}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {scanResult && (
          <div className="space-y-4">
            {isValidating ? (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                <p className="font-semibold">Validating location...</p>
              </div>
            ) : locationError ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p className="font-semibold">{locationError}</p>
              </div>
            ) : (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <p className="font-semibold">Attendance recorded!</p>
              </div>
            )}

            {parsedData && !isValidating && !locationError && (
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <p>
                  <span className="font-semibold">Student ID:</span> {studentId}
                </p>
                <p>
                  <span className="font-semibold">Event:</span> {eventData?.eventName || parsedData.eventId}
                </p>
                {userLocation && (
                  <p>
                    <span className="font-semibold">Your Location:</span> {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {!isValidating && (
              <button
                onClick={resetScanner}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Scan Another
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
