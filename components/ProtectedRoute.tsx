"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

type UserRole = "admin" | "staff" | "student";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(`/login/${allowedRole}`);
      } else if (role !== allowedRole) {
        router.push("/");
      }
    }
  }, [user, role, loading, router, allowedRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || role !== allowedRole) {
    return null;
  }

  return <>{children}</>;
}
