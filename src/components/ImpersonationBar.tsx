"use client";

import { impersonateTenant } from "@/app/actions/superadmin";
import { useState } from "react";

export default function ImpersonationBar({ tenantName }: { tenantName: string }) {
  const [loading, setLoading] = useState(false);

  const handleExit = async () => {
    setLoading(true);
    try {
      await impersonateTenant(null);
      window.location.href = "/superadmin";
    } catch (err) {
      alert("Ошибка при выходе из режима тени");
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-amber-600 to-orange-600 text-white h-12 flex items-center justify-between px-6 shadow-lg animate-in slide-in-from-top duration-500">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
           <span className="text-[10px]">👁</span>
        </div>
        <p className="text-sm font-bold tracking-tight">
          РЕЖИМ ТЕНИ АКТИВЕН: <span className="uppercase ml-1 text-white/90">{tenantName}</span>
        </p>
      </div>
      
      <button 
        onClick={handleExit}
        disabled={loading}
        className="bg-white text-orange-600 px-4 py-1.5 rounded-full text-xs font-black uppercase hover:bg-orange-50 transition-all shadow-md active:scale-95 disabled:opacity-50"
      >
        {loading ? "Выход..." : "Вернуться в суперадминку"}
      </button>
    </div>
  );
}
