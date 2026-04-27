"use client";

import { useState } from "react";
import { toggleTenantSuspension, updateTenantPlan } from "@/app/actions/superadmin";
import { Plan } from "@prisma/client";
import { toast } from "react-hot-toast";

interface Props {
  tenantId: string;
  isSuspended: boolean;
  currentPlan: Plan;
}

export default function SuperadminTenantActions({ tenantId, isSuspended, currentPlan }: Props) {
  const [loading, setLoading] = useState(false);
  const [suspended, setSuspended] = useState(isSuspended);
  const [plan, setPlan] = useState(currentPlan);

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

  return (
    <div className="flex items-center gap-2">
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
    </div>
  );
}
