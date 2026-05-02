"use client";

import { useState } from "react";
import { toggleTenantSuspension, updateTenantPlan, updateTenantSlug } from "@/app/actions/superadmin";
import { Plan } from "@prisma/client";
import { toast } from "react-hot-toast";

interface Props {
  tenantId: string;
  isSuspended: boolean;
  currentPlan: Plan;
  currentSlug: string;
}

export default function SuperadminTenantActions({ tenantId, isSuspended, currentPlan, currentSlug }: Props) {
  const [loading, setLoading] = useState(false);
  const [suspended, setSuspended] = useState(isSuspended);
  const [plan, setPlan] = useState(currentPlan);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [slug, setSlug] = useState(currentSlug);

  const handleToggleFreeze = async () => {
    if (!confirm(suspended ? "Разморозить салон?" : "Заморозить салон? Доступ будет заблокирован.")) return;
    
    setLoading(true);
    try {
      const res = await toggleTenantSuspension(tenantId);
      setSuspended(res.isSuspended);
      toast.success(res.isSuspended ? "Салон заморожен" : "Салон разморожен");
    } catch (err) {
      toast.error("Ошибка при смене статуса");
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async (newPlan: Plan) => {
    setLoading(true);
    try {
      await updateTenantPlan(tenantId, newPlan);
      setPlan(newPlan);
      toast.success(`План изменен на ${newPlan}`);
    } catch (err) {
      toast.error("Ошибка при смене плана");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSlug = async () => {
    if (slug === currentSlug) {
      setIsEditingSlug(false);
      return;
    }
    
    setLoading(true);
    try {
      await updateTenantSlug(tenantId, slug);
      toast.success("Ссылка обновлена");
      setIsEditingSlug(false);
    } catch (err: any) {
      toast.error(err.message || "Ошибка при обновлении ссылки");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {isEditingSlug ? (
        <div className="flex items-center gap-1 animate-in slide-in-from-right-2 duration-300">
           <input 
             type="text" 
             value={slug} 
             onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
             className="bg-white/10 border border-white/20 rounded px-2 py-1 text-[10px] text-white outline-none focus:border-amber-500 w-24"
             autoFocus
           />
           <button onClick={handleSaveSlug} className="text-emerald-500 hover:scale-110 transition-transform">✓</button>
           <button onClick={() => { setSlug(currentSlug); setIsEditingSlug(false); }} className="text-red-500 hover:scale-110 transition-transform">×</button>
        </div>
      ) : (
        <button 
          onClick={() => setIsEditingSlug(true)}
          className="text-white/20 hover:text-amber-500 transition-colors"
          title="Изменить ссылку (URL)"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
        </button>
      )}

      <div className="h-4 w-px bg-white/5" />

      <select 
        value={plan} 
        disabled={loading}
        onChange={(e) => handlePlanChange(e.target.value as Plan)}
        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none hover:border-white/20 transition-all cursor-pointer"
      >
        <option value="FREE">FREE</option>
        <option value="STARTER">STARTER</option>
        <option value="PRO">PRO</option>
        <option value="PREMIUM">PREMIUM</option>
      </select>

      <button
        onClick={handleToggleFreeze}
        disabled={loading}
        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
          suspended 
          ? "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30" 
          : "bg-red-500/20 text-red-500 hover:bg-red-500/30"
        }`}
      >
        {suspended ? "Unfreeze" : "Freeze"}
      </button>

      <button
        onClick={async () => {
          const msg = prompt("Введите сообщение для бизнеса:");
          if (msg) {
             setLoading(true);
             try {
                const { sendChatMessage } = await import("@/app/actions/superadmin");
                await sendChatMessage(tenantId, msg);
                toast.success("Сообщение отправлено");
             } catch (err) {
                toast.error("Ошибка при отправке");
             } finally {
                setLoading(false);
             }
          }
        }}
        disabled={loading}
        className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-all shadow-sm"
        title="Отправить сообщение владельцу"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
      </button>
    </div>
  );
}
