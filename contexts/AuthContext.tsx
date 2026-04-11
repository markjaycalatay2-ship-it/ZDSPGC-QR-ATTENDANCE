"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  Auth,
} from "firebase/auth";
import { doc, getDoc, setDoc, Firestore } from "firebase/firestore";
import { useRouter } from "next/navigation";

type UserRole = "admin" | "staff" | "student" | null;

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, fullName: string, studentId?: string, role?: string, course?: string, year?: string, set?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Initialize Firebase only on client side
    const initFirebase = () => {
      try {
        const authInstance = getFirebaseAuth();
        const dbInstance = getFirebaseDb();
        setAuth(authInstance);
        setDb(dbInstance);

        const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
          setUser(user);
          if (user) {
            const userDoc = await getDoc(doc(dbInstance, "users", user.uid));
            const userData = userDoc.data();
            setRole(userData?.role || null);
          } else {
            setRole(null);
          }
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        // Firebase not initialized (missing config), just set loading to false
        setLoading(false);
        return () => {};
      }
    };

    const unsubscribe = initFirebase();
    return () => unsubscribe();
  }, []);

  const redirectByRole = (userRole: string) => {
    if (userRole === "admin") {
      router.push("/admin/dashboard");
    } else if (userRole === "staff") {
      router.push("/staff/dashboard");
    } else if (userRole === "student") {
      router.push("/student/dashboard");
    } else {
      throw new Error("Invalid user role");
    }
  };

  const loginWithGoogle = async () => {
    if (!auth || !db) throw new Error("Firebase not initialized");
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    
    if (!userDoc.exists()) {
      // New user - create with student role by default
      // You may want to handle this differently
      throw new Error("User not registered. Please contact admin.");
    }
    
    const userData = userDoc.data();
    const userRole = userData?.role;
    
    // Set role state immediately before redirecting
    setRole(userRole || null);
    setUser(userCredential.user);
    
    redirectByRole(userRole);
  };

  const register = async (email: string, password: string, fullName: string, studentId?: string, userRole?: string, course?: string, year?: string, set?: string) => {
    if (!auth || !db) throw new Error("Firebase not initialized");
    
    const finalRole = (userRole as UserRole) || "student";
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user document in Firestore
    const userData: any = {
      email: email,
      fullName: fullName,
      role: finalRole,
      studentId: studentId || null,
      createdAt: new Date().toISOString(),
    };
    
    // Only add course/year/set for students
    if (finalRole === "student") {
      userData.course = course || null;
      userData.year = year || null;
      userData.set = set || null;
    }
    
    await setDoc(doc(db, "users", user.uid), userData);
    
    // Set role state and redirect based on role
    setRole(finalRole);
    setUser(user);
    
    if (finalRole === "admin") {
      router.push("/admin/dashboard");
    } else if (finalRole === "staff") {
      router.push("/staff/dashboard");
    } else {
      router.push("/student/dashboard");
    }
  };

  const login = async (email: string, password: string) => {
    if (!auth || !db) throw new Error("Firebase not initialized");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    const userData = userDoc.data();
    const userRole = userData?.role;

    // Set role state immediately before redirecting
    setRole(userRole || null);
    setUser(userCredential.user);

    redirectByRole(userRole);
  };

  const logout = async () => {
    if (!auth) throw new Error("Firebase not initialized");
    await signOut(auth);
    setRole(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
