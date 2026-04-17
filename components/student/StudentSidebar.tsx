"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

function GearsBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30" style={{ perspective: '1000px' }}>
      <svg className="absolute top-20 left-20 w-48 h-48 animate-[spin_8s_linear_infinite]" style={{ transform: 'rotateX(60deg) rotateZ(0deg)', transformStyle: 'preserve-3d' }} viewBox="0 0 100 100">
        <defs>
          <linearGradient id="gearGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="50%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
          <filter id="shadow1">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.5" />
          </filter>
        </defs>
        <path
          d="M50 0 L60 10 L75 10 L85 20 L85 35 L95 45 L95 55 L85 65 L85 80 L75 90 L60 90 L50 100 L40 90 L25 90 L15 80 L15 65 L5 55 L5 45 L15 35 L15 20 L25 10 L40 10 Z"
          fill="url(#gearGrad1)"
          filter="url(#shadow1)"
          stroke="#0d9488"
          strokeWidth="2"
        />
        <circle cx="50" cy="50" r="15" fill="#0f766e" stroke="#0d9488" strokeWidth="2" filter="url(#shadow1)" />
        <circle cx="50" cy="50" r="8" fill="#0d9488" opacity="0.5" />
      </svg>

      <svg className="absolute top-40 right-32 w-64 h-64 animate-[spin_12s_linear_infinite_reverse]" style={{ transform: 'rotateX(-60deg) rotateZ(0deg)', transformStyle: 'preserve-3d' }} viewBox="0 0 100 100">
        <defs>
          <linearGradient id="gearGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f766e" />
            <stop offset="50%" stopColor="#115e59" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          <filter id="shadow2">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.5" />
          </filter>
        </defs>
        <path
          d="M50 0 L60 10 L75 10 L85 20 L85 35 L95 45 L95 55 L85 65 L85 80 L75 90 L60 90 L50 100 L40 90 L25 90 L15 80 L15 65 L5 55 L5 45 L15 35 L15 20 L25 10 L40 10 Z"
          fill="url(#gearGrad2)"
          filter="url(#shadow2)"
          stroke="#0f766e"
          strokeWidth="2"
        />
        <circle cx="50" cy="50" r="15" fill="#0d9488" stroke="#0f766e" strokeWidth="2" filter="url(#shadow2)" />
        <circle cx="50" cy="50" r="8" fill="#0f766e" opacity="0.5" />
      </svg>

      <svg className="absolute bottom-32 left-40 w-56 h-56 animate-[spin_10s_linear_infinite]" style={{ transform: 'rotateX(45deg) rotateZ(0deg)', transformStyle: 'preserve-3d' }} viewBox="0 0 100 100">
        <defs>
          <linearGradient id="gearGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="50%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
          <filter id="shadow3">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.5" />
          </filter>
        </defs>
        <path
          d="M50 0 L60 10 L75 10 L85 20 L85 35 L95 45 L95 55 L85 65 L85 80 L75 90 L60 90 L50 100 L40 90 L25 90 L15 80 L15 65 L5 55 L5 45 L15 35 L15 20 L25 10 L40 10 Z"
          fill="url(#gearGrad3)"
          filter="url(#shadow3)"
          stroke="#0d9488"
          strokeWidth="2"
        />
        <circle cx="50" cy="50" r="15" fill="#0f766e" stroke="#0d9488" strokeWidth="2" filter="url(#shadow3)" />
        <circle cx="50" cy="50" r="8" fill="#0d9488" opacity="0.5" />
      </svg>

      <svg className="absolute bottom-20 right-20 w-40 h-40 animate-[spin_6s_linear_infinite_reverse]" style={{ transform: 'rotateX(-45deg) rotateZ(0deg)', transformStyle: 'preserve-3d' }} viewBox="0 0 100 100">
        <defs>
          <linearGradient id="gearGrad4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f766e" />
            <stop offset="50%" stopColor="#115e59" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          <filter id="shadow4">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.5" />
          </filter>
        </defs>
        <path
          d="M50 0 L60 10 L75 10 L85 20 L85 35 L95 45 L95 55 L85 65 L85 80 L75 90 L60 90 L50 100 L40 90 L25 90 L15 80 L15 65 L5 55 L5 45 L15 35 L15 20 L25 10 L40 10 Z"
          fill="url(#gearGrad4)"
          filter="url(#shadow4)"
          stroke="#0f766e"
          strokeWidth="2"
        />
        <circle cx="50" cy="50" r="15" fill="#0d9488" stroke="#0f766e" strokeWidth="2" filter="url(#shadow4)" />
        <circle cx="50" cy="50" r="8" fill="#0f766e" opacity="0.5" />
      </svg>

      <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 animate-[spin_15s_linear_infinite]" style={{ transform: 'rotateX(30deg) rotateZ(0deg)', transformStyle: 'preserve-3d' }} viewBox="0 0 100 100">
        <defs>
          <linearGradient id="gearGrad5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="50%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
          <filter id="shadow5">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.5" />
          </filter>
        </defs>
        <path
          d="M50 0 L60 10 L75 10 L85 20 L85 35 L95 45 L95 55 L85 65 L85 80 L75 90 L60 90 L50 100 L40 90 L25 90 L15 80 L15 65 L5 55 L5 45 L15 35 L15 20 L25 10 L40 10 Z"
          fill="url(#gearGrad5)"
          filter="url(#shadow5)"
          stroke="#0d9488"
          strokeWidth="2"
        />
        <circle cx="50" cy="50" r="15" fill="#0f766e" stroke="#0d9488" strokeWidth="2" filter="url(#shadow5)" />
        <circle cx="50" cy="50" r="8" fill="#0d9488" opacity="0.5" />
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
