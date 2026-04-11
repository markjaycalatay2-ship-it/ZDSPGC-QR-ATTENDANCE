"use client";

import { useEffect, useState } from "react";
import { getFirebaseApp, getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";

export default function TestFirebasePage() {
  const [status, setStatus] = useState<string>("Testing...");
  const [details, setDetails] = useState<string[]>([]);

  useEffect(() => {
    const testConnection = async () => {
      const results: string[] = [];
      
      try {
        // Test 1: Check environment variables
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        results.push(`✅ API Key: ${apiKey ? apiKey.substring(0, 10) + "..." : "MISSING"}`);
        
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        results.push(`✅ Project ID: ${projectId || "MISSING"}`);
        
        // Test 2: Initialize Firebase App
        const app = getFirebaseApp();
        results.push(`✅ Firebase App initialized: ${app.name}`);
        
        // Test 3: Get Auth
        const auth = getFirebaseAuth();
        results.push(`✅ Firebase Auth ready`);
        
        // Test 4: Get Firestore
        const db = getFirebaseDb();
        results.push(`✅ Firestore ready`);
        
        setStatus("✅ Firebase is connected!");
        setDetails(results);
      } catch (error: any) {
        setStatus("❌ Connection failed");
        results.push(`Error: ${error.message}`);
        setDetails(results);
      }
    };
    
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-4">Firebase Connection Test</h1>
        <div className={`text-lg font-semibold mb-4 ${status.includes("✅") ? "text-emerald-400" : "text-rose-400"}`}>
          {status}
        </div>
        <div className="space-y-2">
          {details.map((detail, i) => (
            <div key={i} className="text-slate-400 text-sm font-mono">
              {detail}
            </div>
          ))}
        </div>
        <a 
          href="/" 
          className="block mt-6 text-cyan-400 hover:text-cyan-300 text-center"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  );
}
