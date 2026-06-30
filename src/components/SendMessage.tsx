import React, { useState, useEffect } from "react";
import { ViewType } from "../types";
import { 
  Send, ShieldAlert, Sparkles, AlertCircle, CheckCircle, 
  HelpCircle, EyeOff, Plus, HelpCircle as HelpIcon, ArrowRight, Loader2
} from "lucide-react";
import { motion } from "motion/react";

interface SendMessageProps {
  recipientUsername: string;
  onNavigate: (view: ViewType) => void;
}

export default function SendMessage({ recipientUsername, onNavigate }: SendMessageProps) {
  const [recipientExists, setRecipientExists] = useState<boolean | null>(null);
  const [recipientExactName, setRecipientExactName] = useState("");
  const [checking, setChecking] = useState(true);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Characters limit
  const MAX_CHARS = 1000;

  // Fun templates/prompts without emojis (using clean text)
  const templates = [
    "What is one thing I should improve about myself?",
    "Tell me an honest confession about how we met!",
    "If you could describe me in 3 words, what would they be?",
    "What is your absolute favorite memory with me?",
    "Do you have a secret crush on me?"
  ];

  useEffect(() => {
    const checkUser = async () => {
      setChecking(true);
      try {
        const response = await fetch(`/api/user/check/${recipientUsername}`);
        const data = await response.json();
        if (data.exists) {
          setRecipientExists(true);
          setRecipientExactName(data.username);
        } else {
          setRecipientExists(false);
        }
      } catch (err) {
        setRecipientExists(false);
      } finally {
        setChecking(false);
      }
    };

    if (recipientUsername) {
      checkUser();
    }
  }, [recipientUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanText = text.trim();
    if (!cleanText) {
      setError("Please write a secret message first.");
      return;
    }

    if (cleanText.length > MAX_CHARS) {
      setError(`Message cannot exceed ${MAX_CHARS} characters.`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientUsername: recipientExactName || recipientUsername,
          text: cleanText
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to deliver message.");
      }

      setSuccess(true);
      setText("");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const insertTemplate = (template: string) => {
    setText(template);
  };

  // Loading Screen
  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] text-center">
        <Loader2 size={36} className="text-indigo-600 animate-spin mb-4" />
        <p className="text-indigo-900/60 font-sans font-bold">Verifying feedback recipient...</p>
      </div>
    );
  }

  // Recipient User Not Found
  if (recipientExists === false) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-140px)] px-4 py-8">
        <motion.div 
          className="w-full max-w-md rounded-2xl bg-white border border-rose-100 p-6 sm:p-8 shadow-xl text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="inline-flex p-3 rounded-2xl bg-rose-50 text-rose-600 mb-4 border border-rose-100 shadow-inner">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-indigo-950 tracking-tight">Username Not Found</h2>
          <p className="text-indigo-900/60 text-sm mt-3 leading-relaxed">
            The feedback link you visited is invalid. The user <span className="font-mono text-rose-650 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 font-bold">@{recipientUsername}</span> does not exist or has deleted their account.
          </p>

          <button
            onClick={() => onNavigate("home")}
            className="w-full mt-6 flex items-center justify-center space-x-2 px-4 py-3.5 rounded-xl font-bold bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 text-white hover:from-indigo-700 hover:to-violet-700 transition-colors shadow-md cursor-pointer text-sm"
            id="not-found-back-btn"
          >
            <span>Create Your Own Secret Link</span>
            <ArrowRight size={14} className="stroke-[2.5]" />
          </button>
        </motion.div>
      </div>
    );
  }

  // Success Screen
  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-140px)] px-4 py-8">
        <motion.div 
          className="w-full max-w-md rounded-2xl bg-white border border-indigo-100 p-6 sm:p-8 shadow-xl text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="inline-flex p-3 rounded-2xl bg-indigo-50 text-indigo-600 mb-4 border border-indigo-100 shadow-inner">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight">Message Delivered!</h2>
          <p className="text-indigo-900/70 text-sm mt-3 leading-relaxed font-sans">
            Your anonymous feedback has been safely locked and delivered to <span className="font-bold text-indigo-650">@{recipientExactName}</span>. They will never know you sent it!
          </p>

          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950/70 mt-6 leading-relaxed font-sans text-left">
            <span className="font-bold text-indigo-700 block mb-1">🛡️ Complete Incognito Promise</span>
            No cookie, device identifiers, or IPs were sent. Absolute confidentiality maintained.
          </div>

          <div className="h-px bg-indigo-100 my-6"></div>

          <p className="text-indigo-900/60 text-xs mb-3 font-sans font-semibold">Want people to send you secret messages too?</p>

          <button
            onClick={() => onNavigate("signup")}
            className="w-full flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl font-bold bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 transition-colors shadow-lg shadow-indigo-600/15 cursor-pointer text-sm"
            id="success-signup-btn"
          >
            <span>Create Your Own Secret Link</span>
            <ArrowRight size={16} className="stroke-[2.5]" />
          </button>
        </motion.div>
      </div>
    );
  }

  // Active Sending Card
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-140px)] px-4 py-8 relative">
      {/* Glow balls */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-500/10 blur-[90px] pointer-events-none"></div>

      <motion.div
        className="w-full max-w-lg rounded-2xl bg-white border border-indigo-100 p-6 sm:p-8 shadow-xl relative z-10"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Recipient Identity Display */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-600/20 mb-3">
            <EyeOff size={24} className="stroke-[2.5]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-indigo-950 tracking-tight">
            Send Secret Feedback to
            <span className="block text-indigo-600 mt-1">@{recipientExactName}</span>
          </h2>
          <p className="text-indigo-900/60 text-xs sm:text-sm mt-2">
            No name, no registration required. What you write below is 100% anonymous.
          </p>
        </div>

        {/* Error Notification */}
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

        {/* Main form */}
        <form onSubmit={handleSubmit} className="space-y-5" id="send-feedback-form">
          <div>
            <div className="flex justify-between items-center mb-2 font-sans">
              <label className="block text-indigo-950 text-xs font-bold uppercase tracking-wider">
                Write Message
              </label>
              <span className={`text-xs font-bold ${text.length > MAX_CHARS ? "text-rose-600" : "text-indigo-400"}`}>
                {text.length}/{MAX_CHARS}
              </span>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Be honest, be secure, send confessions, ask anything..."
              rows={5}
              maxLength={MAX_CHARS + 50} // allow typing a bit extra for validation check
              className="w-full bg-indigo-50/30 border border-indigo-100 rounded-xl px-4 py-3 text-indigo-950 placeholder-indigo-400/60 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-sans resize-none text-sm sm:text-base leading-relaxed"
              disabled={loading}
            ></textarea>
          </div>

          {/* Quick templates prompt slider */}
          <div>
            <div className="flex items-center space-x-1 mb-2 text-indigo-900/60 text-xs font-bold uppercase tracking-wider font-sans">
              <HelpIcon size={12} className="text-indigo-600" />
              <span>Need Ideas? Click to Write</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
              {templates.map((tpl, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => insertTemplate(tpl)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-indigo-100 bg-indigo-50/40 text-indigo-900/80 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-950 text-left transition-all cursor-pointer font-sans font-semibold"
                >
                  {tpl}
                </button>
              ))}
            </div>
          </div>

          {/* Submit anonymous button */}
          <button
            type="submit"
            disabled={loading || text.trim().length === 0}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3.5 rounded-xl font-bold bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/15 cursor-pointer"
            id="send-feedback-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Delivering incognito...</span>
              </>
            ) : (
              <>
                <Send size={18} className="stroke-[2.5]" />
                <span>Send Anonymously</span>
              </>
            )}
          </button>
        </form>

        {/* Informational warning */}
        <div className="mt-6 flex items-start space-x-2.5 p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900/60 font-sans">
          <EyeOff size={15} className="flex-shrink-0 text-indigo-600 mt-0.5 stroke-[2.2]" />
          <p>
            Your information is fully safe. Senders are completely untraceable. This is an end-to-end secure secret messaging portal.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
