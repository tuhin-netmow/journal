"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Trash2, CheckCircle2, Clock, Eye, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface ContactMessagesManagerProps {
  initialMessages: any[];
}

export function ContactMessagesManager({ initialMessages }: ContactMessagesManagerProps) {
  const router = useRouter();

  const [messages, setMessages] = useState(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  const toggleReadStatus = async (msg: any) => {
    const updatedStatus = !msg.isRead;
    try {
      const res = await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msg._id.toString(), isRead: updatedStatus }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to update status");
      }

      setMessages(
        messages.map((m) =>
          m._id.toString() === msg._id.toString() ? { ...m, isRead: updatedStatus } : m
        )
      );

      if (selectedMessage && selectedMessage._id.toString() === msg._id.toString()) {
        setSelectedMessage({ ...selectedMessage, isRead: updatedStatus });
      }

      router.refresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      const res = await fetch(`/api/contact?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to delete message");
      }

      setMessages(messages.filter((m) => m._id.toString() !== id));
      if (selectedMessage && selectedMessage._id.toString() === id) {
        setSelectedMessage(null);
      }
      router.refresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const openMessage = (msg: any) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      toggleReadStatus(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-serif font-black text-2xl md:text-3xl text-navy">
          Contact Messages
        </h1>
        <p className="text-xs sm:text-sm text-academic-muted mt-0.5">
          Review inquiries submitted by authors, peer reviewers, libraries, and public visitors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-academic-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between text-xs text-academic-muted font-medium">
            <span>
              Total: <strong>{messages.length}</strong> inquiries
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {messages.length === 0 ? (
              <div className="py-12 text-center text-academic-muted text-xs">
                No contact inquiries found.
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg._id.toString()}
                  onClick={() => openMessage(msg)}
                  className={`p-4 cursor-pointer transition-colors flex items-start justify-between gap-4 ${
                    selectedMessage?._id.toString() === msg._id.toString()
                      ? "bg-royal/5 border-l-4 border-royal"
                      : !msg.isRead
                      ? "bg-academic-bg font-semibold"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      {!msg.isRead && (
                        <span className="w-2 h-2 rounded-full bg-royal inline-block" />
                      )}
                      <span className="font-serif font-bold text-navy text-sm truncate">
                        {msg.subject}
                      </span>
                    </div>

                    <div className="text-xs text-academic-text">
                      <span className="font-medium text-navy">{msg.name}</span>{" "}
                      <span className="text-academic-muted">({msg.email})</span>
                    </div>

                    <p className="text-xs text-academic-muted line-clamp-1">
                      {msg.message}
                    </p>
                  </div>

                  <div className="text-right text-[11px] text-academic-muted whitespace-nowrap shrink-0">
                    <div>{formatDate(msg.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Message Detail Drawer */}
        <div className="lg:col-span-1">
          {selectedMessage ? (
            <div className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-4 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-xs text-academic-muted font-medium">
                  {formatDate(selectedMessage.createdAt)}
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleReadStatus(selectedMessage)}
                    className="h-7 text-xs"
                  >
                    {selectedMessage.isRead ? "Mark Unread" : "Mark Read"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(selectedMessage._id.toString())}
                    className="h-7 w-7 p-0 text-rose-600 hover:text-rose-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-academic-muted uppercase font-semibold block">
                  Subject
                </span>
                <h3 className="font-serif font-bold text-lg text-navy mt-0.5">
                  {selectedMessage.subject}
                </h3>
              </div>

              <div className="text-xs space-y-1 bg-academic-bg p-3 rounded-lg border border-gray-100">
                <div>
                  <strong className="text-navy">Sender:</strong> {selectedMessage.name}
                </div>
                <div>
                  <strong className="text-navy">Email:</strong>{" "}
                  <a href={`mailto:${selectedMessage.email}`} className="text-royal hover:underline">
                    {selectedMessage.email}
                  </a>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-academic-muted uppercase font-semibold block mb-1">
                  Message Content
                </span>
                <div className="text-xs text-academic-text bg-white p-4 rounded-lg border border-gray-200 leading-relaxed whitespace-pre-line">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                    selectedMessage.subject
                  )}`}
                  variant="teal"
                  size="sm"
                  className="w-full space-x-1.5 font-semibold"
                >
                  <Mail className="w-4 h-4" />
                  <span>Reply via Email</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-academic-border p-8 text-center text-academic-muted text-xs shadow-sm">
              <Mail className="w-8 h-8 text-academic-muted mx-auto mb-2 opacity-50" />
              <span>Select an inquiry from the left to view complete details.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
