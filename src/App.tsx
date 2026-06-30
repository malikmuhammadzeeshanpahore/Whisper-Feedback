import React, { useState, useEffect } from "react";
import { ViewType, UserSession } from "./types";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import SendMessage from "./components/SendMessage";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck } from "lucide-react";

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>("home");
  const [session, setSession] = useState<UserSession | null>(null);
  const [recipientUsername, setRecipientUsername] = useState<string>("");
  const [initialized, setInitialized] = useState(false);

  // Initialize view and session from URL and localStorage
  useEffect(() => {
    // 1. Check local session
    const storedSession = localStorage.getItem("incognito_session");
    let activeSession: UserSession | null = null;
    if (storedSession) {
      try {
        activeSession = JSON.parse(storedSession);
        setSession(activeSession);
      } catch (e) {
        localStorage.removeItem("incognito_session");
      }
    }

    // 2. Parse URL path for dynamic routing
    const path = window.location.pathname;
    if (path.startsWith("/send/")) {
      const parts = path.split("/");
      const user = parts[2];
      if (user) {
        setRecipientUsername(user);
        setCurrentView("send");
      } else {
        setCurrentView("home");
      }
    } else {
      // If we are at root, show dashboard if logged in, otherwise landing page
      if (activeSession) {
        setCurrentView("dashboard");
      } else {
        setCurrentView("home");
      }
    }
    setInitialized(true);
  }, []);

  // Listen to browser popstate (back/forward button)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const storedSession = localStorage.getItem("incognito_session");
      const activeSession = storedSession ? JSON.parse(storedSession) : null;

      if (path.startsWith("/send/")) {
        const parts = path.split("/");
        const user = parts[2];
        if (user) {
          setRecipientUsername(user);
          setCurrentView("send");
        } else {
          setCurrentView("home");
        }
      } else {
        if (activeSession) {
          setCurrentView("dashboard");
        } else {
          setCurrentView("home");
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Smooth custom navigation function
  const handleNavigate = (view: ViewType, user?: string) => {
    if (view === "send" && user) {
      window.history.pushState({}, "", `/send/${user}`);
      setRecipientUsername(user);
      setCurrentView("send");
    } else {
      window.history.pushState({}, "", "/");
      setCurrentView(view);
    }
  };

  const handleLoginSuccess = (userSession: UserSession) => {
    localStorage.setItem("incognito_session", JSON.stringify(userSession));
    setSession(userSession);
    handleNavigate("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("incognito_session");
    setSession(null);
    handleNavigate("home");
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-indigo-50 text-indigo-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <span className="text-indigo-900/60 font-sans font-bold text-xs">Initializing Secure Shell...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-50/70 via-white to-purple-50/70 text-indigo-950 selection:bg-indigo-600 selection:text-white">
      {/* Navbar always sticky on top */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => handleNavigate(view)}
        session={session}
        onLogout={handleLogout}
      />

      {/* Main Content Stage with transition animations */}
      <main className="max-w-6xl mx-auto px-4 py-6 min-h-[calc(100vh-120px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView === "send" ? `send-${recipientUsername}` : currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {currentView === "home" && (
              <LandingPage onNavigate={(view) => handleNavigate(view)} session={session} />
            )}
            
            {currentView === "login" && (
              <Login onNavigate={(view) => handleNavigate(view)} onLoginSuccess={handleLoginSuccess} />
            )}

            {currentView === "signup" && (
              <Signup onNavigate={(view) => handleNavigate(view)} onSignupSuccess={handleLoginSuccess} />
            )}

            {currentView === "dashboard" && session && (
              <Dashboard session={session} onLogout={handleLogout} />
            )}

            {currentView === "send" && (
              <SendMessage recipientUsername={recipientUsername} onNavigate={(view) => handleNavigate(view)} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating System-wide trust label */}
      <div className="fixed bottom-4 right-4 z-40 hidden md:flex items-center space-x-1.5 bg-white/90 border border-indigo-100 rounded-full px-3 py-1.5 shadow-lg backdrop-blur-sm">
        <ShieldCheck size={14} className="text-indigo-600" />
        <span className="text-[10px] text-indigo-950 font-bold uppercase tracking-wider">
          Secure Feedback System
        </span>
      </div>
    </div>
  );
}
