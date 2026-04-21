"use client";

import { useState } from "react";
import { deleteTenant } from "@/app/actions/superadmin";

export default function DeleteTenantButton({ tenantId, tenantName }: { tenantId: string, tenantName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Вы уверены, что хотите НАВСЕГДА удалить бизнес "${tenantName}"? Это действие нельзя отменить.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTenant(tenantId);
      alert("Бизнес успешно удален");
    } catch (error: any) {
      alert("Ошибка: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${isDeleting ? 'bg-zinc-800 text-zinc-500' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white active:scale-95'}`}
    >
      {isDeleting ? "Удаление..." : "Удалить"}
    </button>
  );
}
