"use client";

import { useState } from "react";
import { impersonateTenant } from "@/app/actions/superadmin";

interface Tenant {
  id: string;
  name: string;
}

export default function ShadowModeModal({ tenants }: { tenants: Tenant[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = async (tenantId: string) => {
    setLoadingId(tenantId);
    try {
      await impersonateTenant(tenantId);
      window.location.href = "/admin";
    } catch (err) {
      alert("Ошибка при входе");
      setLoadingId(null);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-br from-amber-500 to-orange-600 text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 group"
      >
        <span className="text-xl group-hover:rotate-12 transition-transform">🔑</span>
        Активировать Режим Тени
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative bg-[#121212] border border-white/10 w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-white/5 bg-white/[0.02]">
              <h3 className="text-2xl font-black text-white mb-2">Выбор салона</h3>
              <p className="text-white/40 text-sm">Выберите бизнес для мгновенного входа в панель управления</p>
              
              <div className="mt-6 relative">
                <input 
                  type="text"
                  placeholder="Поиск по названию..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-amber-500 transition-all"
                  autoFocus
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20">
                  🔍
                </div>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-4 custom-scrollbar">
              <div className="grid grid-cols-1 gap-2">
                {filteredTenants.length > 0 ? (
                  filteredTenants.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleSelect(t.id)}
                      disabled={loadingId !== null}
                      className="w-full text-left p-4 rounded-2xl hover:bg-white/5 transition-all flex items-center justify-between group"
                    >
                      <div>
                        <p className="font-bold text-white group-hover:text-amber-400 transition-colors">{t.name}</p>
                        <p className="text-[10px] text-white/20 font-mono mt-1 uppercase">{t.id}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                         {loadingId === t.id ? "..." : "→"}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-12 text-center text-white/20">
                     Ничего не найдено
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-black/20 flex justify-end">
               <button 
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
               >
                 Закрыть
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
