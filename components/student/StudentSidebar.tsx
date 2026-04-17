"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

function GearsBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <svg className="absolute top-20 left-20 w-48 h-48 animate-[spin_8s_linear_infinite]" viewBox="0 0 100 100">
        <path
          d="M50 0 L60 10 L75 10 L85 20 L85 35 L95 45 L95 55 L85 65 L85 80 L75 90 L60 90 L50 100 L40 90 L25 90 L15 80 L15 65 L5 55 L5 45 L15 35 L15 20 L25 10 L40 10 Z"
          fill="none"
          stroke="#0d9488"
          strokeWidth="3"
        />
        <circle cx="50" cy="50" r="15" fill="none" stroke="#0d9488" strokeWidth="3" />
      </svg>

      <svg className="absolute top-40 right-32 w-64 h-64 animate-[spin_12s_linear_infinite_reverse]" viewBox="0 0 100 100">
        <path
          d="M50 0 L60 10 L75 10 L85 20 L85 35 L95 45 L95 55 L85 65 L85 80 L75 90 L60 90 L50 100 L40 90 L25 90 L15 80 L15 65 L5 55 L5 45 L15 35 L15 20 L25 10 L40 10 Z"
          fill="none"
          stroke="#0f766e"
          strokeWidth="3"
        />
        <circle cx="50" cy="50" r="15" fill="none" stroke="#0f766e" strokeWidth="3" />
      </svg>

      <svg className="absolute bottom-32 left-40 w-56 h-56 animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100">
        <path
          d="M50 0 L60 10 L75 10 L85 20 L85 35 L95 45 L95 55 L85 65 L85 80 L75 90 L60 90 L50 100 L40 90 L25 90 L15 80 L15 65 L5 55 L5 45 L15 35 L15 20 L25 10 L40 10 Z"
          fill="none"
          stroke="#0d9488"
          strokeWidth="3"
        />
        <circle cx="50" cy="50" r="15" fill="none" stroke="#0d9488" strokeWidth="3" />
      </svg>

      <svg className="absolute bottom-20 right-20 w-40 h-40 animate-[spin_6s_linear_infinite_reverse]" viewBox="0 0 100 100">
        <path
          d="M50 0 L60 10 L75 10 L85 20 L85 35 L95 45 L95 55 L85 65 L85 80 L75 90 L60 90 L50 100 L40 90 L25 90 L15 80 L15 65 L5 55 L5 45 L15 35 L15 20 L25 10 L40 10 Z"
          fill="none"
          stroke="#0f766e"
          strokeWidth="3"
        />
        <circle cx="50" cy="50" r="15" fill="none" stroke="#0f766e" strokeWidth="3" />
      </svg>

      <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 animate-[spin_15s_linear_infinite]" viewBox="0 0 100 100">
        <path
          d="M50 0 L60 10 L75 10 L85 20 L85 35 L95 45 L95 55 L85 65 L85 80 L75 90 L60 90 L50 100 L40 90 L25 90 L15 80 L15 65 L5 55 L5 45 L15 35 L15 20 L25 10 L40 10 Z"
          fill="none"
          stroke="#0d9488"
          strokeWidth="2"
        />
        <circle cx="50" cy="50" r="15" fill="none" stroke="#0d9488" strokeWidth="2" />
      </svg>
    </div>
  );
}

export function StudentSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { href: "/student/dashboard", label: "Dashboard" },
    { href: "/student/events", label: "Events" },
    { href: "/student/attendance", label: "Attendance History" },
  ];

  return (
    <aside className="w-64 bg-teal-900 border-r border-teal-800 min-h-screen flex flex-col relative">
      <GearsBackground />
      {/* Glow effect */}
      <div className="absolute top-0 left-0 w-full h-32 bg-teal-500/5 blur-3xl pointer-events-none" />

      <div className="p-6 border-b border-teal-800 relative z-10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
          Student Portal
        </h1>
      </div>

      <nav className="flex-1 p-4 relative z-10">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-4 py-3 rounded-xl transition-all ${
                  pathname === item.href
                    ? "bg-gradient-to-r from-teal-500/20 to-teal-600/20 text-teal-400 border border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                    : "text-teal-200 hover:text-teal-400 hover:bg-teal-800/50"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-teal-800 relative z-10">
        <button
          onClick={logout}
          className="w-full px-4 py-3 text-left text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/30"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export { GearsBackground };
