"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [error, setError] = useState<string>("");
  const scannedRef = useRef(false);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    scanner = new Html5QrcodeScanner(
      "staff-qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        if (!scannedRef.current) {
          scannedRef.current = true;
          onScanRef.current(decodedText);
        }
      },
      (err) => {
        // Silent error - scanner continues trying
      }
    );

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Scan QR Code</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        <p className="text-gray-600 mb-4 text-center">
          Position the QR code within the camera view
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <div id="staff-qr-reader" className="w-full"></div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
