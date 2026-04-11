"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface LoginFormProps {
  role: "admin" | "staff" | "student";
}

// Google Icon Component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

// Eye Icon Components
function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

export function LoginForm({ role }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || "Google sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColors = () => {
    switch (role) {
      case "admin":
        return "from-cyan-500 to-cyan-600";
      case "staff":
        return "from-purple-500 to-purple-600";
      case "student":
        return "from-emerald-500 to-emerald-600";
      default:
        return "from-cyan-500 to-cyan-600";
    }
  };

  const getRoleGlow = () => {
    switch (role) {
      case "admin":
        return "shadow-[0_0_30px_rgba(34,211,238,0.3)]";
      case "staff":
        return "shadow-[0_0_30px_rgba(168,85,247,0.3)]";
      case "student":
        return "shadow-[0_0_30px_rgba(16,185,129,0.3)]";
      default:
        return "shadow-[0_0_30px_rgba(34,211,238,0.3)]";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-cyan-950/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent capitalize">
              {role} Login
            </h1>
            <p className="text-slate-400">Sign in to access your portal</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-400 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-300 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r ${getRoleColors()} hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all ${getRoleGlow()}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Google Sign In */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900/80 text-slate-400">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
            >
              <GoogleIcon className="w-5 h-5" />
              Sign in with Google
            </button>

            {/* Back Button */}
            <div className="pt-4 border-t border-slate-700">
              <Link
                href="/"
                className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
