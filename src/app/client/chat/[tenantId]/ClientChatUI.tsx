"use client";

import { useState, useEffect, useRef } from "react";
import { sendMessage } from "@/app/actions/chat";
import Link from "next/link";

export default function ClientChatUI({ tenant, initialMessages, userId }: any) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    try {
      const newMessage = await sendMessage({
        content: input,
        tenantId: tenant.id,
        senderId: userId,
        senderType: "CLIENT"
      });
      setMessages([...messages, newMessage]);
      setInput("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto border-x border-black/5 shadow-2xl bg-[#F5F5F7]">
      {/* Header */}
      <header className="p-6 bg-white border-b border-black/5 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/client/dashboard" className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:bg-zinc-100 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 overflow-hidden">
            {tenant.logoUrl ? <img src={tenant.logoUrl} className="w-full h-full object-cover" /> : tenant.name[0]}
          </div>
          <div>
            <h1 className="font-bold text-zinc-900 leading-tight">{tenant.name}</h1>
            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">В сети</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg: any) => {
          const isMe = msg.senderId === userId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-medium shadow-sm ${
                isMe 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white text-zinc-900 rounded-bl-none border border-black/5'
              }`}>
                {msg.content}
                <div className={`text-[9px] mt-1 opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Footer */}
      <footer className="p-6 bg-white border-t border-black/5 pb-10">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Напишите сообщение..."
            className="flex-1 bg-[#F5F5F7] border-none rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
          >
            <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
          </button>
        </form>
      </footer>
    </div>
  );
}
