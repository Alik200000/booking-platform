"use client";

import { useState, useEffect } from "react";

interface Message {
  id: string;
  title: string;
  content: string;
  type: string;
}

export default function SystemNotificationPopup({ messages }: { messages: Message[] }) {
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (messages.length > 0) {
      // Ищем первое сообщение, которое пользователь еще не видел в этой сессии
      const unseen = messages.find(m => !sessionStorage.getItem(`seen_msg_${m.id}`));
      
      if (unseen) {
        setCurrentMessage(unseen);
        // Небольшая задержка для плавного появления после загрузки страницы
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [messages]);

  const handleClose = () => {
    setIsVisible(false);
    if (currentMessage) {
      sessionStorage.setItem(`seen_msg_${currentMessage.id}`, "true");
      // После закрытия проверяем, есть ли еще сообщения
      setTimeout(() => {
        const next = messages.find(m => !sessionStorage.getItem(`seen_msg_${m.id}`));
        if (next) {
          setCurrentMessage(next);
          setIsVisible(true);
        } else {
          setCurrentMessage(null);
        }
      }, 500);
    }
  };

  if (!currentMessage) return null;

  const typeStyles: any = {
    INFO: { bg: "bg-blue-600", icon: "🔵" },
    WARNING: { bg: "bg-amber-500", icon: "🟠" },
    SUCCESS: { bg: "bg-emerald-500", icon: "🟢" }
  };

  const style = typeStyles[currentMessage.type] || typeStyles.INFO;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl transform transition-all duration-700 ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-20 scale-90'}`}>
        
        <div className={`w-16 h-16 ${style.bg} rounded-[1.5rem] flex items-center justify-center text-3xl mb-8 shadow-lg shadow-gray-200`}>
          {style.icon}
        </div>

        <h2 className="text-3xl font-black text-[#1C1C1C] leading-tight mb-4">
          {currentMessage.title}
        </h2>

        <p className="text-gray-500 font-medium leading-relaxed text-lg mb-10">
          {currentMessage.content}
        </p>

        <button 
          onClick={handleClose}
          className="w-full py-5 bg-[#1C1C1C] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl active:scale-95"
        >
          Понятно, закрыть
        </button>
      </div>
    </div>
  );
}
