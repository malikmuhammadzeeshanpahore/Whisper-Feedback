import React, { useState, useEffect } from "react";
import { UserSession, Message } from "../types";
import { 
  Copy, Check, Share2, MessageSquare, Trash2, RefreshCw, 
  Search, Lock, EyeOff, Sparkles, Inbox, Calendar, Loader2, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DashboardProps {
  session: UserSession;
  onLogout: () => void;
}

export default function Dashboard({ session, onLogout }: DashboardProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate shareable link
  const shareUrl = `${window.location.origin}/send/${session.username}`;

  const fetchMessages = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/messages", {
        headers: {
          Authorization: `Bearer ${session.token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to load messages.");
      }
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [session]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMessages(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteMessage = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.token}`
        }
      });
      if (response.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
      } else {
        throw new Error("Could not delete message.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete message");
    } finally {
      setDeletingId(null);
    }
  };

  // WhatsApp share link
  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Suno Yaaro! 🤫 Mujhe aik secret anonymous message bhejo. Mujhe bilkul pata nahi chalega k kisne bheja he! 😉 Send here:\n${shareUrl}`
    );
    const whatsappUrl = `https://api.whatsapp.com/send?text=${text}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  // Filter messages based on search query
  const filteredMessages = messages.filter(msg => 
    msg.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative" id="dashboard-container">
      {/* Background ambient glowing balls */}
      <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-indigo-500/5 blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-violet-500/5 blur-[80px] pointer-events-none"></div>

      {/* Profile Header Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-indigo-100">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-sm font-bold mb-1.5">
            <Sparkles size={14} className="text-indigo-600" />
            <span>Welcome Back</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight">
            @{session.username}'s Dashboard
          </h2>
        </div>

        {/* Total Message Counter Badge */}
        <div className="mt-4 md:mt-0 flex items-center space-x-3 bg-white border border-indigo-100 rounded-2xl px-5 py-3 shadow-sm">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <MessageSquare size={18} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-950 leading-none">{messages.length}</div>
            <div className="text-[10px] text-indigo-900/50 uppercase tracking-wider font-bold mt-0.5 font-sans">
              Secret Feedbacks
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Link Box with glowing borders */}
      <div className="rounded-2xl bg-white border border-indigo-100 p-5 md:p-6 mb-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-indigo-50 blur-xl -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <h3 className="text-base font-bold text-indigo-950 mb-2 flex items-center space-x-2">
            <EyeOff size={16} className="text-indigo-600 stroke-[2.2]" />
            <span>Your Personal Secret Feedback Link</span>
          </h3>
          <p className="text-indigo-900/60 text-xs sm:text-sm mb-4">
            Post this link on your WhatsApp Status, Instagram Bio, or Snap to get anonymous questions, feedbacks, and honest messages!
          </p>

          {/* Link Copy Widget */}
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="flex-1 min-w-0 flex items-center bg-indigo-50/40 border border-indigo-100 rounded-xl px-4 py-3 font-mono text-sm text-indigo-800">
              <span className="truncate select-all">{shareUrl}</span>
            </div>

            <div className="flex gap-2">
              {/* Copy Button */}
              <button
                onClick={handleCopyLink}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/10 hover:scale-[1.01] cursor-pointer"
                id="copy-link-btn"
              >
                {copied ? (
                  <>
                    <Check size={16} className="stroke-[2.5]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} className="stroke-[2.5]" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              {/* WhatsApp Share Button */}
              <button
                onClick={handleWhatsAppShare}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-bold bg-violet-600 hover:bg-violet-700 text-white transition-colors shadow-md shadow-violet-600/10 hover:scale-[1.01] cursor-pointer"
                id="whatsapp-share-btn"
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Header & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-black text-indigo-950 flex items-center space-x-2">
          <Inbox size={20} className="text-indigo-600 stroke-[2.2]" />
          <span>Received Messages</span>
        </h3>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-60">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-indigo-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full bg-indigo-50/30 border border-indigo-100 rounded-xl pl-10 pr-4 py-2 text-indigo-950 placeholder-indigo-400/60 text-sm focus:outline-none focus:border-indigo-500 transition-all font-sans"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-indigo-100 bg-white text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 transition-colors cursor-pointer"
            title="Refresh messages"
            id="refresh-messages-btn"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Error Widget */}
      {error && (
        <div className="flex items-center space-x-2 p-4 mb-6 rounded-xl bg-rose-50 border border-rose-100 text-rose-750 text-sm">
          <AlertCircle size={20} className="flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Inbox Messages List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-indigo-100 rounded-2xl shadow-sm">
          <Loader2 size={32} className="text-indigo-600 animate-spin mb-4" />
          <p className="text-indigo-900/50 text-sm font-sans">Loading your secret messages...</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-indigo-100 rounded-2xl shadow-sm text-center">
          <div className="p-4 rounded-full bg-indigo-50 text-indigo-500 mb-4 border border-indigo-100">
            <Lock size={32} className="stroke-[2.2]" />
          </div>
          <h4 className="text-lg font-bold text-indigo-950 mb-1 font-sans">
            {searchQuery ? "No matching messages found" : "No messages yet!"}
          </h4>
          <p className="text-indigo-900/60 text-sm max-w-sm mx-auto font-sans leading-relaxed">
            {searchQuery 
              ? "Try typing another word or keyword in the search filter." 
              : "Post your link on WhatsApp status so people can send you anonymous questions!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredMessages.map((msg, index) => (
              <motion.div
                key={msg.id}
                className="p-5 rounded-2xl bg-white border border-indigo-100 shadow-sm flex items-start justify-between gap-4 relative overflow-hidden group hover:border-indigo-300 hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                layout
              >
                {/* Visual glass sheen decoration */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 to-violet-500"></div>

                <div className="flex-1 pl-2">
                  {/* Anonymous Header Accent */}
                  <div className="flex items-center space-x-1.5 mb-2.5 text-[10px] sm:text-xs font-bold text-indigo-600 uppercase tracking-widest font-sans">
                    <EyeOff size={11} className="stroke-[2.2]" />
                    <span>Incognito Message #{messages.length - index}</span>
                  </div>

                  {/* Message Text */}
                  <p className="text-indigo-950 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans break-words selection:bg-indigo-100 selection:text-indigo-950">
                    {msg.text}
                  </p>

                  {/* Date Badge */}
                  <div className="flex items-center space-x-1.5 text-indigo-900/40 text-[10px] font-semibold mt-3 font-sans">
                    <Calendar size={11} />
                    <span>{formatDate(msg.createdAt)}</span>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this secret feedback permanently?")) {
                      handleDeleteMessage(msg.id);
                    }
                  }}
                  disabled={deletingId === msg.id}
                  className="p-2 rounded-xl border border-rose-100 text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-all duration-200 cursor-pointer self-start"
                  title="Delete message"
                  id={`delete-msg-btn-${msg.id}`}
                >
                  {deletingId === msg.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
