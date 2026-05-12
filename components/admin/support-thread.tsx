"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Send, ChevronDown, ChevronUp, Loader2, User, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
  sender: { name: string };
}

interface Thread {
  id: string;
  subject: string;
  isOpen: boolean;
  updatedAt: string;
  user: { name: string; email: string };
  messages: Message[];
}

interface Props {
  thread: Thread;
}

export function AdminSupportThread({ thread }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await fetch(`/api/admin/support/${thread.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: reply }),
      });
      toast({ title: "Reply sent" });
      setReply("");
      router.refresh();
    } finally {
      setSending(false);
    }
  };

  const toggleClose = async () => {
    await fetch(`/api/admin/support/${thread.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOpen: !thread.isOpen }),
    });
    router.refresh();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-full bg-restaurant-gold/10 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-restaurant-gold" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900 text-sm truncate">{thread.subject}</p>
              <span className={cn("shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold", thread.isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                {thread.isOpen ? "Open" : "Closed"}
              </span>
            </div>
            <p className="text-xs text-gray-500">{thread.user.name} · {thread.user.email} · {formatDate(thread.updatedAt)}</p>
          </div>
          <span className="text-xs text-gray-400 shrink-0 ml-2">{thread.messages.length} msgs</span>
        </div>
        <div className="ml-3 shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100">
          <div className="p-5 space-y-3 max-h-80 overflow-y-auto bg-gray-50">
            {thread.messages.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.isAdmin ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-xs lg:max-w-md rounded-2xl px-4 py-3 text-sm",
                  msg.isAdmin ? "bg-restaurant-dark text-white rounded-br-none" : "bg-white text-gray-900 rounded-bl-none shadow-sm"
                )}>
                  <div className="flex items-center gap-1 mb-1">
                    {msg.isAdmin ? <Shield className="w-3 h-3 opacity-60" /> : <User className="w-3 h-3 opacity-60" />}
                    <span className="text-xs opacity-60">{msg.sender.name}</span>
                  </div>
                  <p>{msg.content}</p>
                  <p className="text-xs opacity-50 mt-1">{formatDate(msg.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100 flex gap-3 items-end">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply..."
              rows={2}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-restaurant-gold resize-none"
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={sendReply}
                disabled={sending || !reply.trim()}
                className="bg-restaurant-gold text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-restaurant-gold/90 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                Reply
              </button>
              <button
                onClick={toggleClose}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-semibold transition-colors",
                  thread.isOpen ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"
                )}
              >
                {thread.isOpen ? "Close" : "Reopen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
