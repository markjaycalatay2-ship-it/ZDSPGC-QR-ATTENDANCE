"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StaffSidebar } from "@/components/staff/StaffSidebar";

export const dynamic = "force-dynamic";

// Print styles
const printStyles = `
  @media print {
    @page {
      margin: 20mm;
    }
    
    body {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    
    /* Hide sidebar and non-print elements */
    aside, button, .no-print {
      display: none !important;
    }
    
    /* Show main content full width */
    main {
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    /* Table formatting for print */
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      border: 1px solid #000;
      padding: 8px;
      text-align: left;
    }
    
    th {
      background-color: #f0f0f0 !important;
      font-weight: bold;
    }
    
    /* Ensure table doesn't break across pages poorly */
    tr {
      page-break-inside: avoid;
    }
    
    /* Print header */
    .print-header {
      display: block !important;
      margin-bottom: 20px;
    }
    
    .print-header h2 {
      font-size: 24px;
      margin-bottom: 10px;
    }
    
    .print-header p {
      font-size: 14px;
      color: #666;
    }
  }
  
  /* Hide print header on screen */
  .print-header {
    display: none;
  }
`;

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  eventName: string;
  scannedAt: string;
  status: string;
}

export default function LiveMonitoringPage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const db = getFirebaseDb();
    
    // Real-time listener for attendance collection
    const attendanceQuery = query(
      collection(db, "attendance"),
      orderBy("scannedAt", "desc")
    );

    const unsubscribe = onSnapshot(attendanceQuery, async (snapshot) => {
      const records: AttendanceRecord[] = [];

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        
        // Fetch student details from users collection
        let studentName = "Unknown";
        let course = "Unknown";
        
        try {
          const userDoc = await getDoc(doc(db, "users", data.studentId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            studentName = userData.fullName || "Unknown";
            course = userData.course || "Unknown";
          }
        } catch (err) {
          console.error("Error fetching user:", err);
        }

        records.push({
          id: docSnapshot.id,
          studentId: data.studentId || "N/A",
          studentName,
          course,
          eventName: data.eventName || "Unknown Event",
          scannedAt: data.scannedAt || new Date().toISOString(),
          status: "Present",
        });
      }

      setAttendanceRecords(records);
      setIsLoading(false);
    }, (err) => {
      console.error("Error in attendance listener:", err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString();
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <ProtectedRoute allowedRole="staff">
      <style>{printStyles}</style>
      <div className="flex min-h-screen bg-gray-100">
        <StaffSidebar />

        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Live Monitoring</h1>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm text-green-600 font-medium">Live</span>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading attendance data...</div>
            </div>
          ) : attendanceRecords.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <p className="text-gray-500">No attendance records yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Print header - only visible when printing */}
              <div className="print-header px-6 pt-6">
                <h2>Attendance Report</h2>
                <p>Generated on: {new Date().toLocaleString()}</p>
                <p>Total Records: {attendanceRecords.length}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {attendanceRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-medium">{formatTime(record.scannedAt)}</div>
                          <div className="text-gray-400 text-xs">{formatDate(record.scannedAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {record.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.course}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.studentId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.eventName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
