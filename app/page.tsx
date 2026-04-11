import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-cyan-950/20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <nav className="relative z-10 backdrop-blur-md bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              QR Attendance
            </Link>
            <div className="flex gap-4">
              <Link
                href="/login/admin"
                className="text-slate-400 hover:text-cyan-400 px-3 py-2 rounded-md text-sm font-medium transition-all hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              >
                Admin Login
              </Link>
              <Link
                href="/login/staff"
                className="text-slate-400 hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-all hover:shadow-[0_0_15px_rgba(192,132,252,0.3)]"
              >
                Staff Login
              </Link>
              <Link
                href="/login/student"
                className="text-slate-400 hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                Student Login
              </Link>
              <Link
                href="/register"
                className="text-slate-400 hover:text-cyan-400 px-3 py-2 rounded-md text-sm font-medium transition-all hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] border border-slate-700 hover:border-cyan-500/50"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-3xl">
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full" />
            <svg
              className="mx-auto h-32 w-32 relative z-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="url(#gradient)"
            >
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 4v1m6 11h2m-6 0h-2v4h2v-4zM6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent leading-tight">
            ZDSPGC DIMATALING
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-200">
            QR Code Event Attendance System
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            Next-generation attendance tracking with dynamic QR codes, real-time monitoring, and precision location validation
          </p>
          <div className="flex gap-6 justify-center flex-wrap">
            <Link
              href="/login/admin"
              className="group relative px-8 py-4 rounded-xl font-semibold overflow-hidden transition-all hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-cyan-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_30px_rgba(34,211,238,0.5)]" />
              <span className="relative z-10 text-slate-950">Admin Portal</span>
            </Link>
            <Link
              href="/login/staff"
              className="group relative px-8 py-4 rounded-xl font-semibold overflow-hidden transition-all hover:scale-105 border border-purple-500/50"
            >
              <div className="absolute inset-0 bg-slate-900" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_30px_rgba(168,85,247,0.3)]" />
              <span className="relative z-10 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Staff Portal</span>
            </Link>
            <Link
              href="/login/student"
              className="group relative px-8 py-4 rounded-xl font-semibold overflow-hidden transition-all hover:scale-105 border border-emerald-500/50"
            >
              <div className="absolute inset-0 bg-slate-900" />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_30px_rgba(16,185,129,0.3)]" />
              <span className="relative z-10 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Student Portal</span>
            </Link>
            <Link
              href="/register"
              className="group relative px-8 py-4 rounded-xl font-semibold overflow-hidden transition-all hover:scale-105 border border-cyan-500/50"
            >
              <div className="absolute inset-0 bg-slate-900" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_30px_rgba(34,211,238,0.3)]" />
              <span className="relative z-10 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Register here</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative z-10 backdrop-blur-md bg-slate-900/50 border-t border-slate-800 p-6">
        <div className="max-w-7xl mx-auto text-center text-slate-500">
          <p>&copy; 2026 QR Code Attendance System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
