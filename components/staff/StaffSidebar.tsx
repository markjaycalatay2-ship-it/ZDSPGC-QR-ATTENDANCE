"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function StaffSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { href: "/staff/dashboard", label: "Dashboard" },
    { href: "/staff/events", label: "Events" },
    { href: "/staff/monitoring", label: "Live Monitoring" },
    { href: "/staff/lost-found", label: "Lost and Found" },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 min-h-screen flex flex-col relative">
      {/* Glow effect */}
      <div className="absolute top-0 left-0 w-full h-32 bg-purple-500/5 blur-3xl pointer-events-none" />

      <div className="p-6 border-b border-slate-800 relative z-10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Staff Panel
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
                    ? "bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                    : "text-slate-400 hover:text-purple-400 hover:bg-slate-800/50"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-800 relative z-10">
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
