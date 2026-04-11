"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AddUserForm } from "@/components/admin/AddUserForm";
import { UsersTable } from "@/components/admin/UsersTable";

export const dynamic = "force-dynamic";

interface User {
  id: string;
  fullName: string;
  studentId: string;
  course: string;
  role: string;
  createdAt?: string;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const db = getFirebaseDb();
      const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(usersQuery);
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      setUsers(usersData);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <ProtectedRoute allowedRole="admin">
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />

        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-8">Manage Users</h1>

          <AddUserForm onUserAdded={fetchUsers} />

          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading users...</div>
            </div>
          ) : (
            <UsersTable users={users} onUserDeleted={fetchUsers} />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
