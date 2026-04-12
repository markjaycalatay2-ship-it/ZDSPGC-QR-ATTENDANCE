"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StaffSidebar } from "@/components/staff/StaffSidebar";

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
  claimedBy?: string;
  claimedDate?: string;
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

export default function StaffLostFoundPage() {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<LostFoundItem | null>(null);
  const [filter, setFilter] = useState<"all" | "lost" | "found" | "claimed">("all");

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const db = getFirebaseDb();
      const itemRef = doc(db, "lost_and_found", editingItem.id);
      
      await updateDoc(itemRef, {
        name: editingItem.name,
        category: editingItem.category,
        description: editingItem.description,
        location: editingItem.location,
        status: editingItem.status,
        finderName: editingItem.finderName,
        finderContact: editingItem.finderContact,
        finderDepartment: editingItem.finderDepartment,
        claimedBy: editingItem.claimedBy || "",
        claimedDate: editingItem.claimedDate || "",
      });

      alert("Item updated successfully!");
      setEditingItem(null);
      fetchItems();
    } catch (err) {
      console.error("Error updating item:", err);
      alert("Failed to update item. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const db = getFirebaseDb();
      await deleteDoc(doc(db, "lost_and_found", id));
      
      alert("Item deleted successfully!");
      fetchItems();
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete item. Please try again.");
    }
  };

  const handleMarkClaimed = async (item: LostFoundItem) => {
    try {
      const db = getFirebaseDb();
      const itemRef = doc(db, "lost_and_found", item.id);
      
      const claimedBy = prompt("Enter the name of the person claiming this item:");
      if (!claimedBy) return;

      await updateDoc(itemRef, {
        status: "claimed",
        claimedBy: claimedBy,
        claimedDate: new Date().toISOString().split('T')[0],
      });

      alert("Item marked as claimed!");
      fetchItems();
    } catch (err) {
      console.error("Error claiming item:", err);
      alert("Failed to mark item as claimed.");
    }
  };

  const filteredItems = items.filter((item) => 
    filter === "all" ? true : item.status === filter
  );

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
    <ProtectedRoute allowedRole="staff">
      <div className="flex min-h-screen bg-gray-100">
        <StaffSidebar />

        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">Manage Lost and Found</h1>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-6">
            {(["all", "lost", "found", "claimed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                  filter === f
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {f} ({f === "all" ? items.length : items.filter(i => i.status === f).length})
              </button>
            ))}
          </div>

          {/* Edit Modal */}
          {editingItem && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-6 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Edit Item</h2>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                      <input
                        type="text"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={editingItem.category}
                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={editingItem.location}
                        onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={editingItem.status}
                        onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as "lost" | "found" | "claimed" })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="lost">Lost</option>
                        <option value="found">Found</option>
                        <option value="claimed">Claimed</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Finder Name</label>
                      <input
                        type="text"
                        value={editingItem.finderName}
                        onChange={(e) => setEditingItem({ ...editingItem, finderName: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                      <input
                        type="text"
                        value={editingItem.finderContact}
                        onChange={(e) => setEditingItem({ ...editingItem, finderContact: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <input
                        type="text"
                        value={editingItem.finderDepartment}
                        onChange={(e) => setEditingItem({ ...editingItem, finderDepartment: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {editingItem.status === "claimed" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Claimed By</label>
                        <input
                          type="text"
                          value={editingItem.claimedBy || ""}
                          onChange={(e) => setEditingItem({ ...editingItem, claimedBy: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Claimed Date</label>
                        <input
                          type="date"
                          value={editingItem.claimedDate || ""}
                          onChange={(e) => setEditingItem({ ...editingItem, claimedDate: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Update Item
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Items Table */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading items...</div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <p className="text-gray-500">No items found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Item</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-800">{item.name}</p>
                            <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                            {item.claimedBy && (
                              <p className="text-sm text-blue-600 mt-1">
                                Claimed by: {item.claimedBy} on {item.claimedDate}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                        <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.location}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.date}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div>
                            <p>{item.finderName}</p>
                            <p className="text-gray-500">{item.finderContact}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {item.status !== "claimed" && (
                              <button
                                onClick={() => handleMarkClaimed(item)}
                                className="px-3 py-1 bg-emerald-500 text-white text-sm rounded hover:bg-emerald-600 transition-colors"
                              >
                                Mark Claimed
                              </button>
                            )}
                            <button
                              onClick={() => setEditingItem(item)}
                              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
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
