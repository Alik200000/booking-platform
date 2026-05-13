"use client";

import { registerBusiness } from "@/app/actions/auth";
import Link from "next/link";
import { useState } from "react";

export default function BusinessSetupPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setLoading(true);
    const res = await registerBusiness(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col justify-center items-center p-6">
      <div className="mb-10 text-center">
         <h1 className="text-4xl font-black text-[#1D1D1F] tracking-tight mb-2">Запустить бизнес</h1>
         <p className="text-[#86868B] font-medium">Создайте свою цифровую экосистему за 2 минуты</p>
      </div>

      <div className="w-full max-w-xl bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-black/5 border border-black/5">
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-[#86868B] uppercase tracking-widest mb-2 px-1">Название бизнеса</label>
              <input 
                required
                name="name"
                type="text" 
                placeholder="Elite Spa Almaty"
                className="w-full bg-[#F5F5F7] border-none rounded-2xl px-6 py-4 font-bold text-[#1D1D1F] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#86868B] uppercase tracking-widest mb-2 px-1">Город</label>
              <select 
                required
                name="city"
                className="w-full bg-[#F5F5F7] border-none rounded-2xl px-6 py-4 font-bold text-[#1D1D1F] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none"
              >
                <option value="Алматы">Алматы</option>
                <option value="Астана">Астана</option>
                <option value="Шымкент">Шымкент</option>
                <option value="Караганда">Караганда</option>
                <option value="Атырау">Атырау</option>
                <option value="Актобе">Актобе</option>
                <option value="Уральск">Уральск</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#86868B] uppercase tracking-widest mb-2 px-1">Короткий URL (Slug)</label>
            <div className="relative">
              <input 
                required
                name="slug"
                type="text" 
                placeholder="my-salon"
                className="w-full bg-[#F5F5F7] border-none rounded-2xl px-6 py-4 font-bold text-[#1D1D1F] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all pr-24" 
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-bold text-[#86868B]">.zapis.online</span>
            </div>
          </div>

          <div className="h-px bg-black/5 my-8"></div>

          <div>
            <label className="block text-[10px] font-black text-[#86868B] uppercase tracking-widest mb-2 px-1">Ваш рабочий Email</label>
            <input 
              required
              name="email"
              type="email" 
              placeholder="owner@example.com"
              className="w-full bg-[#F5F5F7] border-none rounded-2xl px-6 py-4 font-bold text-[#1D1D1F] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#86868B] uppercase tracking-widest mb-2 px-1">Придумайте пароль</label>
            <input 
              required
              name="password"
              type="password" 
              placeholder="••••••••"
              className="w-full bg-[#F5F5F7] border-none rounded-2xl px-6 py-4 font-bold text-[#1D1D1F] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
            />
          </div>

          {error && <p className="text-rose-500 text-xs font-bold text-center animate-bounce">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Создаем платформу..." : "Создать платформу"}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-black/5 text-center">
          <p className="text-[#86868B] font-medium text-sm">
            Уже есть аккаунт? <Link href="/login" className="text-blue-600 font-bold hover:underline">Войти</Link>
          </p>
        </div>
      </div>
      
      <p className="mt-8 text-[11px] text-[#86868B] font-medium">
        Подключая бизнес, вы соглашаетесь с условиями оферты
      </p>
    </div>
  );
}
