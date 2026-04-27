"use client";

import { useState } from "react";
import { impersonateTenant } from "@/app/actions/superadmin";

export default function ImpersonateButton({ tenantId }: { tenantId: string | null }) {
  const [loading, setLoading] = useState(false);
  const isLogout = tenantId === null;

  const handleImpersonate = async () => {
    const msg = isLogout ? "Выйти из режима тени?" : "Войти в панель управления этого салона?";
    if (!confirm(msg)) return;
    
    setLoading(true);
    try {
      await impersonateTenant(tenantId);
      window.location.href = isLogout ? "/superadmin" : "/admin"; 
    } catch (err) {
      alert("Ошибка при смене режима");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleImpersonate}
      disabled={loading}
      className={`${isLogout ? 'bg-amber-500 text-white' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white'} px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all flex items-center gap-2`}
      title={isLogout ? "Вернуться в суперадминку" : "Войти как владелец"}
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {isLogout ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        ) : (
          <>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </>
        )}
      </svg>
      {loading ? "..." : (isLogout ? "Выйти" : "Войти")}
    </button>
  );
}
