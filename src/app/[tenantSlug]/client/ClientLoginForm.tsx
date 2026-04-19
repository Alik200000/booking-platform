"use client";

import { useState } from "react";
import { loginClient } from "@/app/actions/client-auth";

export default function ClientLoginForm({ tenantId, tenantSlug }: { tenantId: string, tenantSlug: string }) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await loginClient(tenantId, tenantSlug, phone);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      <div>
        <label className="block text-sm font-semibold mb-2 text-zinc-900">Номер телефона</label>
        <input 
          type="tel" 
          value={phone} 
          onChange={e => setPhone(e.target.value)} 
          className="apple-input" 
          placeholder="+7 (999) 000-00-00" 
          required 
        />
      </div>
      
      {error && <div className="text-red-500 text-sm font-medium text-center">{error}</div>}

      <button 
        type="submit" 
        disabled={loading}
        className="apple-button w-full py-4 text-lg"
      >
        {loading ? "Проверка..." : "Войти"}
      </button>
    </form>
  );
}
