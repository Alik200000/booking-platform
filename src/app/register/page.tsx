"use client";

import { useState } from "react";
import { registerBusiness } from "@/app/actions/auth";
import Link from "next/link";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await registerBusiness(formData);
    
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
         <h1 className="text-[32px] font-bold tracking-tight text-[#1D1D1F] mb-2">Создайте аккаунт</h1>
         <p className="text-[17px] text-[#86868B] max-w-[320px] mx-auto leading-snug">Подключите свой салон и начните принимать онлайн-записи уже сегодня.</p>
      </div>

      <div className="bg-white max-w-[440px] w-full p-10 rounded-[32px] shadow-sm border border-black/[0.04]">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-semibold border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold mb-2 text-[#1D1D1F] ml-1">Название салона</label>
              <input name="name" type="text" required className="w-full px-5 py-4 rounded-2xl border border-black/5 bg-[#F5F5F7] text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10 outline-none transition-all font-medium placeholder:text-[#86868B]" placeholder="Beauty Bar" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold mb-2 text-[#1D1D1F] ml-1">URL (Ссылка)</label>
              <input name="slug" type="text" required className="w-full px-5 py-4 rounded-2xl border border-black/5 bg-[#F5F5F7] text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10 outline-none transition-all font-medium placeholder:text-[#86868B]" placeholder="beauty-bar" />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-semibold mb-2 text-[#1D1D1F] ml-1">Email</label>
            <input name="email" type="email" required className="w-full px-5 py-4 rounded-2xl border border-black/5 bg-[#F5F5F7] text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10 outline-none transition-all font-medium placeholder:text-[#86868B]" placeholder="hello@beautybar.com" />
          </div>
          <div>
            <label className="block text-[13px] font-semibold mb-2 text-[#1D1D1F] ml-1">Пароль</label>
            <input name="password" type="password" required className="w-full px-5 py-4 rounded-2xl border border-black/5 bg-[#F5F5F7] text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10 outline-none transition-all font-medium placeholder:text-[#86868B]" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 mt-4 bg-[#0071E3] text-white rounded-2xl font-semibold text-[17px] hover:bg-[#0077ED] active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm">
            {loading ? "Создание..." : "Зарегистрировать бизнес"}
          </button>
        </form>
      </div>

      <p className="mt-8 text-[15px] text-[#86868B]">
        Уже есть аккаунт? <Link href="/login" className="text-[#0071E3] hover:underline">Войти</Link>
      </p>
    </div>
  );
}
