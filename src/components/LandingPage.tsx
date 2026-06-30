import React from "react";
import { ViewType, UserSession } from "../types";
import { Shield, Link, MessageSquare, EyeOff, Sparkles, ArrowRight, ArrowUpRight, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onNavigate: (view: ViewType) => void;
  session: UserSession | null;
}

export default function LandingPage({ onNavigate, session }: LandingPageProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between" id="landing-container">
      {/* Hero Section */}
      <div className="relative py-14 px-4 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-[90px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full bg-violet-400/10 blur-[100px] pointer-events-none"></div>

        <motion.div
          className="max-w-4xl mx-auto text-center relative z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Tagline Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-bold mb-6 shadow-sm">
            <Sparkles size={13} className="text-violet-500 animate-pulse" />
            <span>100% Anonymous Feedback Platform</span>
          </motion.div>

          {/* Hero Header with Vibrant Indigo Gradients */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl font-sans font-black tracking-tight text-indigo-950 mb-6 leading-tight"
          >
            Suno Apni Tarfeen Ki
            <span className="block mt-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
              Asli Aur Sachhi Baat!
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-indigo-900/70 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-sans"
          >
            Create your unique anonymous link, share it on your status (WhatsApp, Instagram, or Twitter), and receive sincere feedback, secret messages, and confessions. You'll never find out who sent them!
          </motion.p>

          {/* Main CTA with beautiful hover gradient scales */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {session ? (
              <button
                onClick={() => onNavigate("dashboard")}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-600/20 hover:scale-[1.02] cursor-pointer text-lg"
                id="cta-dashboard-btn"
              >
                <span>Go to Your Dashboard</span>
                <ArrowRight size={18} className="stroke-[2.5]" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigate("signup")}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-xl shadow-indigo-600/15 hover:scale-[1.02] cursor-pointer text-lg"
                  id="cta-signup-btn"
                >
                  <span>Get Your Feedback Link</span>
                  <ArrowRight size={18} className="stroke-[2.5]" />
                </button>
                <button
                  onClick={() => onNavigate("login")}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-xl font-semibold border-2 border-indigo-200 text-indigo-750 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300 cursor-pointer text-lg"
                  id="cta-login-btn"
                >
                  <span>Log In to Account</span>
                  <ArrowUpRight size={18} />
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 100% Privacy */}
          <div className="p-7 rounded-2xl bg-white border border-indigo-100 shadow-sm relative overflow-hidden group hover:border-indigo-300 hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="p-3 w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 mb-5 flex items-center justify-center shadow-inner">
              <EyeOff size={22} className="stroke-[2.2]" />
            </div>
            <h3 className="text-xl font-bold text-indigo-950 mb-2 font-sans">Full Incognito</h3>
            <p className="text-indigo-900/60 text-sm font-sans leading-relaxed">
              We never collect visitor details, IP addresses, or device signatures. The messages are 100% anonymous, keeping both sender and receiver completely secure.
            </p>
          </div>

          {/* Card 2: Simple Sharing */}
          <div className="p-7 rounded-2xl bg-white border border-indigo-100 shadow-sm relative overflow-hidden group hover:border-indigo-300 hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="p-3 w-12 h-12 rounded-xl bg-pink-50 text-pink-600 mb-5 flex items-center justify-center shadow-inner">
              <Link size={22} className="stroke-[2.2]" />
            </div>
            <h3 className="text-xl font-bold text-indigo-950 mb-2 font-sans">Instant Shareable Link</h3>
            <p className="text-indigo-900/60 text-sm font-sans leading-relaxed">
              Get your unique link instantly after registration. Put it on your WhatsApp Story, Instagram Bio, or share it directly with friends to start receiving feedback.
            </p>
          </div>

          {/* Card 3: Free & Protected */}
          <div className="p-7 rounded-2xl bg-white border border-indigo-100 shadow-sm relative overflow-hidden group hover:border-indigo-300 hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="p-3 w-12 h-12 rounded-xl bg-amber-50 text-amber-600 mb-5 flex items-center justify-center shadow-inner">
              <Shield size={22} className="stroke-[2.2]" />
            </div>
            <h3 className="text-xl font-bold text-indigo-950 mb-2 font-sans">Strictly Private Messages</h3>
            <p className="text-indigo-900/60 text-sm font-sans leading-relaxed">
              No one else can read your messages. Only you have access to your personal inbox dashboard, protected with enterprise-grade password encryption.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive FAQ / How it Works */}
      <div className="max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="rounded-2xl bg-white border border-indigo-100 p-6 md:p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-indigo-950 mb-6 flex items-center space-x-2">
            <HelpCircle className="text-indigo-600" size={24} />
            <span>How Does It Work?</span>
          </h3>
          <div className="space-y-4">
            <div className="flex space-x-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm font-sans mt-0.5">
                1
              </div>
              <div>
                <h4 className="text-base font-bold text-indigo-950">Create your free Account</h4>
                <p className="text-indigo-900/60 text-sm mt-0.5">Register with a unique username and password. No email is required to maintain absolute user privacy!</p>
              </div>
            </div>

            <div className="flex space-x-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm font-sans mt-0.5">
                2
              </div>
              <div>
                <h4 className="text-base font-bold text-indigo-950">Share Your Link</h4>
                <p className="text-indigo-900/60 text-sm mt-0.5">Copy your personal link from your dashboard and post it on your favorite social media platforms.</p>
              </div>
            </div>

            <div className="flex space-x-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm font-sans mt-0.5">
                3
              </div>
              <div>
                <h4 className="text-base font-bold text-indigo-950">Read Secret Messages</h4>
                <p className="text-indigo-900/60 text-sm mt-0.5">Check your dashboard inbox. Messages are shown instantly. You can delete messages whenever you want!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="text-center py-6 border-t border-indigo-100 text-xs text-indigo-400 font-medium mt-12">
        <p>© 2026 Whisper Inc. • Private & Secure • No Tracking</p>
      </footer>
    </div>
  );
}
