"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await requestPasswordReset(email);
      if (res.success) {
        setMessage("Если такой аккаунт существует, мы отправили письмо с кодом на вашу почту.");
      } else {
        setError("Ошибка при отправке. Попробуйте позже.");
      }
    } catch (err) {
      setError("Что-то пошло не так.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
         <h1 className="text-[32px] font-bold tracking-tight text-[#1D1D1F] mb-2">Восстановление доступа</h1>
         <p className="text-[17px] text-[#86868B] max-w-[300px] mx-auto leading-snug">Введите ваш Email, чтобы получить инструкции по сбросу пароля.</p>
      </div>

      <div className="bg-white max-w-[400px] w-full p-10 rounded-[32px] shadow-sm border border-black/[0.04]">
        {message ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <p className="text-emerald-600 font-bold mb-6">{message}</p>
            <Link href="/login" className="text-[#0071E3] font-bold hover:underline">Вернуться ко входу</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}
            <div>
              <label className="block text-[13px] font-semibold mb-2 text-[#1D1D1F] ml-1">Ваш Email</label>
              <input 
                type="email" 
                required 
                className="w-full px-5 py-4 rounded-2xl border border-black/5 bg-[#F5F5F7] text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10 outline-none transition-all font-medium" 
                placeholder="hello@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-[#0071E3] text-white rounded-2xl font-semibold text-[17px] hover:bg-[#0077ED] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? "Отправка..." : "Получить код"}
            </button>
            <div className="text-center">
               <Link href="/login" className="text-[13px] text-[#86868B] hover:text-[#1D1D1F] transition-colors">Вернуться назад</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
