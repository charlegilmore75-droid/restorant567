"use client";

import { useEffect, useState, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useSession } from "next-auth/react";
import { formatDate } from "@/lib/utils";
import { MessageCircle, Plus, Send, Loader2, ChevronLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Thread {
  id: string;
  subject: string;
  isOpen: boolean;
  updatedAt: string;
  messages: Message[];
}

interface Message {
  id: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
  sender: { name: string };
}

export default function SupportPage() {
  const t = useTranslations("support");
  const locale = useLocale();
  const { data: session } = useSession();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [reply, setReply] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchThreads = () => {
    fetch("/api/support")
      .then((r) => r.json())
      .then((d) => setThreads(d.threads || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchThreads(); }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages]);

  const createThread = async () => {
    if (!newSubject.trim() || !newMessage.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: newSubject, message: newMessage }),
      });
      const data = await res.json();
      if (res.ok) {
        setThreads((p) => [data.thread, ...p]);
        setActiveThread(data.thread);
        setNewSubject(""); setNewMessage(""); setShowNew(false);
      }
    } finally {
      setSending(false);
    }
  };

  const sendReply = async () => {
    if (!reply.trim() || !activeThread) return;
    setSending(true);
    try {
      const res = await fetch(`/api/support/${activeThread.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: reply }),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveThread((p) => p ? { ...p, messages: [...p.messages, data.message] } : null);
        setReply("");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-restaurant-cream">
      <Navbar />
      <div className="pt-20">
        <div className="restaurant-gradient pt-12 pb-16">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>{t("title")}</h1>
            <div className="w-16 h-1 bg-restaurant-gold rounded mx-auto" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex">
            {/* Sidebar */}
            <div className={cn("w-full sm:w-80 shrink-0 border-r border-gray-100 flex flex-col", activeThread ? "hidden sm:flex" : "flex")}>
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">{t("threads")}</h2>
                <button
                  onClick={() => setShowNew(true)}
                  className="flex items-center gap-1 text-sm bg-restaurant-gold text-white px-3 py-1.5 rounded-lg hover:bg-restaurant-gold/90 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> {t("new_thread")}
                </button>
              </div>

              {showNew && (
                <div className="p-4 bg-amber-50 border-b border-amber-100 space-y-3">
                  <input
                    placeholder={t("subject")}
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-restaurant-gold"
                  />
                  <textarea
                    placeholder={t("type_message")}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-restaurant-gold resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={createThread} disabled={sending} className="flex-1 bg-restaurant-gold text-white py-2 rounded-lg text-sm font-semibold hover:bg-restaurant-gold/90 transition-colors disabled:opacity-70">
                      {sending ? "Sending..." : t("send")}
                    </button>
                    <button onClick={() => setShowNew(false)} className="px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">✕</button>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-restaurant-gold" /></div>
                ) : threads.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{t("no_threads")}</p>
                  </div>
                ) : (
                  threads.map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => setActiveThread(thread)}
                      className={cn(
                        "w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors",
                        activeThread?.id === thread.id && "bg-amber-50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-gray-900 text-sm truncate">{thread.subject}</p>
                        <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded-full ${thread.isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {thread.isOpen ? t("open") : t("closed")}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(thread.updatedAt)}</p>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat */}
            <div className={cn("flex-1 flex flex-col", !activeThread ? "hidden sm:flex" : "flex")}>
              {!activeThread ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
                  <MessageCircle className="w-12 h-12 opacity-20" />
                  <p>Select a conversation</p>
                </div>
              ) : (
                <>
                  <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <button onClick={() => setActiveThread(null)} className="sm:hidden p-1 hover:bg-gray-100 rounded-lg">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h3 className="font-semibold text-gray-900">{activeThread.subject}</h3>
                      <span className={`text-xs ${activeThread.isOpen ? "text-green-600" : "text-gray-400"}`}>
                        {activeThread.isOpen ? t("open") : t("closed")}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeThread.messages.map((msg) => (
                      <div key={msg.id} className={cn("flex", msg.isAdmin ? "justify-start" : "justify-end")}>
                        <div className={cn(
                          "max-w-xs lg:max-w-md rounded-2xl px-4 py-3 text-sm",
                          msg.isAdmin
                            ? "bg-gray-100 text-gray-900 rounded-tl-none"
                            : "bg-restaurant-gold text-white rounded-tr-none"
                        )}>
                          {msg.isAdmin && <p className="font-semibold text-xs mb-1 text-gray-500">Support Team</p>}
                          <p>{msg.content}</p>
                          <p className={cn("text-xs mt-1", msg.isAdmin ? "text-gray-400" : "text-white/70")}>
                            {formatDate(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  {activeThread.isOpen && (
                    <div className="p-4 border-t border-gray-100 flex gap-3">
                      <input
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendReply()}
                        placeholder={t("type_message")}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-restaurant-gold"
                      />
                      <button
                        onClick={sendReply}
                        disabled={sending || !reply.trim()}
                        className="bg-restaurant-gold text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-restaurant-gold/90 transition-colors disabled:opacity-50"
                      >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
