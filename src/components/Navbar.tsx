import React from "react";
import { ViewType, UserSession } from "../types";
import { MessageSquareCode, LayoutDashboard, LogIn, UserPlus, LogOut, Home, KeyRound } from "lucide-react";

interface NavbarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  session: UserSession | null;
  onLogout: () => void;
}

export default function Navbar({ currentView, onNavigate, session, onLogout }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-indigo-100 px-4 py-3.5 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand Logo with a gorgeous Indigo/Violet Gradient */}
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center space-x-2 focus:outline-none group cursor-pointer"
          id="navbar-brand-btn"
        >
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-250">
            <MessageSquareCode size={20} className="stroke-[2.5]" />
          </div>
          <span className="font-sans font-black text-xl tracking-tight bg-gradient-to-r from-indigo-900 via-indigo-950 to-indigo-800 bg-clip-text text-transparent">
            Whisper Feedback
          </span>
        </button>

        {/* Navigation Items */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          <button
            onClick={() => onNavigate("home")}
            className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              currentView === "home"
                ? "bg-indigo-50 text-indigo-750 border border-indigo-100"
                : "text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/50"
            }`}
            id="nav-home-btn"
          >
            <Home size={15} className="stroke-[2.2]" />
            <span className="hidden sm:inline">Home</span>
          </button>

          {session ? (
            <>
              <button
                onClick={() => onNavigate("dashboard")}
                className={`flex items-center space-x-1 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  currentView === "dashboard"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    : "text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/50"
                }`}
                id="nav-dashboard-btn"
              >
                <LayoutDashboard size={15} className="stroke-[2.2]" />
                <span>Dashboard</span>
              </button>

              <div className="h-5 w-px bg-indigo-100 mx-1 hidden sm:block"></div>

              <div className="flex items-center space-x-1.5 text-indigo-700/85 text-xs font-mono px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 hidden md:flex">
                <KeyRound size={12} className="text-indigo-600" />
                <span>@{session.username}</span>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center space-x-1 px-3 py-2 rounded-xl text-sm font-semibold text-rose-600 hover:text-rose-750 hover:bg-rose-50 transition-all duration-200 cursor-pointer"
                id="nav-logout-btn"
              >
                <LogOut size={15} className="stroke-[2.2]" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate("login")}
                className={`flex items-center space-x-1 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  currentView === "login"
                    ? "bg-indigo-50 text-indigo-800 border border-indigo-100"
                    : "text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/50"
                }`}
                id="nav-login-btn"
              >
                <LogIn size={15} className="stroke-[2.2]" />
                <span>Login</span>
              </button>

              <button
                onClick={() => onNavigate("signup")}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 transition-all duration-200 shadow-md shadow-indigo-600/15 hover:shadow-indigo-600/25 hover:scale-[1.02] cursor-pointer"
                id="nav-signup-btn"
              >
                <UserPlus size={15} className="stroke-[2.5]" />
                <span>Sign Up</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
