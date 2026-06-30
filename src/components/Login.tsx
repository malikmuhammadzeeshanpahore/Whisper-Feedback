import React, { useState } from "react";
import { ViewType, UserSession } from "../types";
import { User, Lock, LogIn, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import CryptoJS from "crypto-js";

interface LoginProps {
  onNavigate: (view: ViewType) => void;
  onLoginSuccess: (session: UserSession) => void;
}

export default function Login({ onNavigate, onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const cleanUsername = username.trim().toLowerCase();
      
      const userRef = doc(db, "users", cleanUsername);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error("Invalid username or password.");
      }
      
      const userData = userSnap.data();
      const passwordHash = CryptoJS.SHA256(password).toString();
      
      if (userData.passwordHash !== passwordHash) {
        throw new Error("Invalid username or password.");
      }
      
      const mockToken = btoa(cleanUsername) + "." + CryptoJS.SHA256(cleanUsername + "secret").toString();

      onLoginSuccess({
        username: userData.username,
        token: mockToken
      });
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-140px)] px-4 py-8 relative">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none"></div>

      <motion.div
        className="w-full max-w-md rounded-2xl bg-white border border-indigo-100 p-6 sm:p-8 shadow-xl relative z-10"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header decoration */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-600/20 mb-3">
            <Lock size={24} className="stroke-[2.5]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight">Welcome Back</h2>
          <p className="text-indigo-900/60 text-sm mt-2">Enter your credentials to access your secret messages.</p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="flex items-center space-x-2 p-3.5 mb-5 rounded-xl bg-rose-50 border border-rose-100 text-rose-750 text-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AlertCircle size={18} className="flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
          <div>
            <label className="block text-indigo-950 text-xs font-bold uppercase tracking-wider mb-2 font-sans">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-indigo-500">
                <User size={18} className="stroke-[2.2]" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full bg-indigo-50/30 border border-indigo-100 rounded-xl pl-11 pr-4 py-3 text-indigo-950 placeholder-indigo-400/60 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-sans"
                autoComplete="username"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-indigo-950 text-xs font-bold uppercase tracking-wider font-sans">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-indigo-500">
                <Lock size={18} className="stroke-[2.2]" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-indigo-50/30 border border-indigo-100 rounded-xl pl-11 pr-4 py-3 text-indigo-950 placeholder-indigo-400/60 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-sans"
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button with animated states */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3.5 rounded-xl font-bold bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/25 cursor-pointer"
            id="login-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Logging you in...</span>
              </>
            ) : (
              <>
                <LogIn size={18} className="stroke-[2.5]" />
                <span>Log In Now</span>
              </>
            )}
          </button>
        </form>

        {/* Signup redirection footer link */}
        <div className="mt-8 text-center text-sm border-t border-indigo-50 pt-6">
          <p className="text-indigo-900/60">
            Don't have a feedback account?{" "}
            <button
              onClick={() => onNavigate("signup")}
              className="text-indigo-600 hover:text-indigo-800 font-bold underline focus:outline-none cursor-pointer transition-colors"
              id="login-to-signup-btn"
            >
              Sign up for free
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
