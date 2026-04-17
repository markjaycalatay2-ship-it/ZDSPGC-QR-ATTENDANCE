"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StudentSidebar, GearsBackground } from "@/components/student/StudentSidebar";
import { useAuth } from "@/contexts/AuthContext";

export const dynamic = "force-dynamic";

interface LostFoundItem {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  date: string;
  status: "lost" | "found" | "claimed";
  finderName: string;
  finderContact: string;
  finderDepartment: string;
  imageUrl?: string;
  timestamp: string;
}

const categories = [
  "Electronics",
  "Documents",
  "Accessories",
  "Clothing",
  "Keys",
  "Wallet/Purse",
  "Others"
];

export default function StudentLostFoundPage() {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    location: "",
    status: "lost" as "lost" | "found",
    finderName: "",
    finderContact: "",
    finderDepartment: "",
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const db = getFirebaseDb();
      const itemsQuery = query(
        collection(db, "lost_and_found"),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(itemsQuery);
      
      const itemsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as LostFoundItem[];
      
      setItems(itemsList);
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const db = getFirebaseDb();
      await addDoc(collection(db, "lost_and_found"), {
        ...formData,
        date: new Date().toISOString().split('T')[0],
        timestamp: Timestamp.now().toString(),
        claimedBy: "",
        claimedDate: "",
      });
      
      alert("Item posted successfully!");
      setShowForm(false);
      setFormData({
        name: "",
        category: "",
        description: "",
        location: "",
        status: "lost",
        finderName: "",
        finderContact: "",
        finderDepartment: "",
      });
      fetchItems();
    } catch (err) {
      console.error("Error posting item:", err);
      alert("Failed to post item. Please try again.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "found":
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">Found</span>;
      case "lost":
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">Lost</span>;
      case "claimed":
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">Claimed</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">{status}</span>;
    }
  };

  return (
    <ProtectedRoute allowedRole="student">
      <div className="flex min-h-screen bg-teal-100 relative overflow-hidden">
        <GearsBackground />
        <StudentSidebar />

        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Lost and Found</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              {showForm ? "Cancel" : "+ Post Item"}
            </button>
          </div>

          {/* Post Item Form */}
          {showForm && (
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
              <h2 className="text-xl font-semibold mb-4">Post Lost/Found Item</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="e.g., Blue Backpack"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                    placeholder="Describe the item (color, brand, distinguishing marks, etc.)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location Found/Lost</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="e.g., Library, Room 201"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as "lost" | "found" })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="lost">I Lost This Item</option>
                      <option value="found">I Found This Item</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      value={formData.finderName}
                      onChange={(e) => setFormData({ ...formData, finderName: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <input
                      type="text"
                      value={formData.finderContact}
                      onChange={(e) => setFormData({ ...formData, finderContact: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="e.g., 09123456789"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={formData.finderDepartment}
                      onChange={(e) => setFormData({ ...formData, finderDepartment: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="e.g., BSIT"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Post Now
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Items List */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading items...</div>
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="p-4 bg-gray-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Items Posted</h3>
              <p className="text-gray-500">Be the first to post a lost or found item!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    {getStatusBadge(item.status)}
                    <span className="text-sm text-gray-500">{item.date}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{item.name}</h3>
                  <p className="text-sm text-blue-600 font-medium mb-2">{item.category}</p>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {item.location}
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {item.finderName} ({item.finderDepartment})
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {item.finderContact}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
