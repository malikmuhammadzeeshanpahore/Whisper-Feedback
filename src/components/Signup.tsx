import React, { useState } from "react";
import { ViewType, UserSession } from "../types";
import { User, Lock, UserPlus, AlertCircle, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface SignupProps {
  onNavigate: (view: ViewType) => void;
  onSignupSuccess: (session: UserSession) => void;
}

export default function Signup({ onNavigate, onSignupSuccess }: SignupProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Validations
  const isUsernameValid = username.trim().length >= 3 && username.trim().length <= 20 && /^[a-zA-Z0-9_-]+$/.test(username.trim());
  const isPasswordValid = password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!isUsernameValid) {
      setError("Username is invalid. Read instructions below.");
      return;
    }

    if (!isPasswordValid) {
      setError("Password is too short.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed. Username may already exist.");
      }

      onSignupSuccess({
        username: data.username,
        token: data.token
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
            <UserPlus size={24} className="stroke-[2.5]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight">Create Free Account</h2>
          <p className="text-indigo-900/60 text-sm mt-2">Claim your username and start receiving sincere feedbacks.</p>
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
        <form onSubmit={handleSubmit} className="space-y-5" id="signup-form">
          <div>
            <label className="block text-indigo-950 text-xs font-bold uppercase tracking-wider mb-2 font-sans">
              Choose Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-indigo-500">
                <User size={18} className="stroke-[2.2]" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ""))}
                placeholder="e.g. noshirwaan"
                className="w-full bg-indigo-50/30 border border-indigo-100 rounded-xl pl-11 pr-4 py-3 text-indigo-950 placeholder-indigo-400/60 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-sans font-medium"
                autoComplete="off"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-indigo-950 text-xs font-bold uppercase tracking-wider mb-2 font-sans">
              Choose Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-indigo-500">
                <Lock size={18} className="stroke-[2.2]" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-indigo-50/30 border border-indigo-100 rounded-xl pl-11 pr-4 py-3 text-indigo-950 placeholder-indigo-400/60 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-sans"
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
          </div>

          {/* Validation Guidelines Panel */}
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-2.5">
            <h4 className="font-bold text-indigo-950 font-sans">Username Requirements:</h4>
            <div className="space-y-2 font-sans">
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={13} className={username.trim().length >= 3 && username.trim().length <= 20 ? "text-indigo-600" : "text-indigo-900/30"} />
                <span className={username.trim().length >= 3 && username.trim().length <= 20 ? "text-indigo-950 font-semibold" : "text-indigo-900/50"}>3 to 20 characters length</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={13} className={/^[a-zA-Z0-9_-]+$/.test(username.trim()) && username.trim().length > 0 ? "text-indigo-600" : "text-indigo-900/30"} />
                <span className={/^[a-zA-Z0-9_-]+$/.test(username.trim()) && username.trim().length > 0 ? "text-indigo-950 font-semibold" : "text-indigo-900/50"}>Letters, numbers, _, - only (no spaces)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={13} className={isPasswordValid ? "text-indigo-600" : "text-indigo-900/30"} />
                <span className={isPasswordValid ? "text-indigo-950 font-semibold" : "text-indigo-900/50"}>Password is at least 6 characters long</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isUsernameValid || !isPasswordValid}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3.5 rounded-xl font-bold bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/25 cursor-pointer"
            id="signup-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Creating your account...</span>
              </>
            ) : (
              <>
                <UserPlus size={18} className="stroke-[2.5]" />
                <span>Register Account</span>
              </>
            )}
          </button>
        </form>

        {/* Login redirection footer link */}
        <div className="mt-8 text-center text-sm border-t border-indigo-50 pt-6">
          <p className="text-indigo-900/60">
            Already have an account?{" "}
            <button
              onClick={() => onNavigate("login")}
              className="text-indigo-600 hover:text-indigo-800 font-bold underline focus:outline-none cursor-pointer transition-colors"
              id="signup-to-login-btn"
            >
              Log in here
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
