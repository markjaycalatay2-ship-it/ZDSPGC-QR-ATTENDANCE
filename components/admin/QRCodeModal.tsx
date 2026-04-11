"use client";

import { useEffect, useState, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { doc, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

interface QRCodeModalProps {
  eventId: string;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
}

const TOKEN_INTERVAL = 30000; // 30 seconds

export function QRCodeModal({ eventId, eventName, isOpen, onClose }: QRCodeModalProps) {
  const [token, setToken] = useState<string>("");
  const [qrData, setQrData] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(30);
  const [db, setDb] = useState<any>(null);

  // Initialize Firebase DB
  useEffect(() => {
    if (isOpen) {
      try {
        const dbInstance = getFirebaseDb();
        setDb(dbInstance);
      } catch (err) {
        console.error("Failed to initialize Firebase:", err);
      }
    }
  }, [isOpen]);

  // Generate and save token
  const generateAndSaveToken = useCallback(async () => {
    if (!db || !isOpen) return;

    const newToken = `${eventId}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const newQrData = JSON.stringify({ eventId, token: newToken });

    setToken(newToken);
    setQrData(newQrData);
    setCountdown(30);

    // Save token to Firestore
    try {
      await setDoc(doc(db, "eventTokens", eventId), {
        eventId,
        token: newToken,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + TOKEN_INTERVAL).toISOString(),
      });
    } catch (err) {
      console.error("Failed to save token:", err);
    }
  }, [db, eventId, isOpen]);

  // Start interval on open
  useEffect(() => {
    if (isOpen && db) {
      generateAndSaveToken(); // Initial token

      const interval = setInterval(() => {
        generateAndSaveToken();
      }, TOKEN_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [isOpen, db, generateAndSaveToken]);

  // Countdown timer
  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, countdown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Event QR Code</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        <p className="text-gray-600 mb-4 text-center">{eventName}</p>

        <div className="flex justify-center mb-6">
          {qrData ? (
            <QRCodeSVG value={qrData} size={256} level="H" />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center bg-gray-100">
              <p className="text-gray-500">Generating...</p>
            </div>
          )}
        </div>

        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">
            QR code refreshes in <span className="font-bold text-blue-600">{countdown}</span> seconds
          </p>
        </div>

        <p className="text-xs text-gray-400 text-center mb-4">
          Scan this QR code to check in for the event
        </p>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
