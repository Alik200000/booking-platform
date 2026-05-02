"use client";

import { useState } from "react";
import { registerBusiness } from "@/app/actions/auth";
import Link from "next/link";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState("");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const transliterated = name.toLowerCase()
      .replace(/а/g, 'a').replace(/б/g, 'b').replace(/в/g, 'v').replace(/г/g, 'g').replace(/д/g, 'd')
      .replace(/е|ё/g, 'e').replace(/ж/g, 'zh').replace(/з/g, 'z').replace(/и/g, 'i').replace(/й/g, 'y')
      .replace(/к/g, 'k').replace(/л/g, 'l').replace(/м/g, 'm').replace(/н/g, 'n').replace(/о/g, 'o')
      .replace(/п/g, 'p').replace(/р/g, 'r').replace(/с/g, 's').replace(/т/g, 't').replace(/у/g, 'u')
      .replace(/ф/g, 'f').replace(/х/g, 'h').replace(/ц/g, 'ts').replace(/ч/g, 'ch').replace(/ш/g, 'sh')
      .replace(/щ/g, 'sch').replace(/ъ|ь/g, '').replace(/ы/g, 'y').replace(/э/g, 'e').replace(/ю/g, 'yu').replace(/я/g, 'ya')
      .replace(/[^a-z0-9\-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    setSlug(transliterated);
  };

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
              <input name="name" type="text" onChange={handleNameChange} required className="w-full px-5 py-4 rounded-2xl border border-black/5 bg-[#F5F5F7] text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10 outline-none transition-all font-medium placeholder:text-[#86868B]" placeholder="Beauty Bar" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold mb-2 text-[#1D1D1F] ml-1">URL (Ссылка)</label>
              <input name="slug" type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required className="w-full px-5 py-4 rounded-2xl border border-black/5 bg-[#F5F5F7] text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10 outline-none transition-all font-medium placeholder:text-[#86868B]" placeholder="beauty-bar" />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-semibold mb-2 text-[#1D1D1F] ml-1">Email</label>
            <input name="email" type="email" required className="w-full px-5 py-4 rounded-2xl border border-black/5 bg-[#F5F5F7] text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10 outline-none transition-all font-medium placeholder:text-[#86868B]" placeholder="hello@beautybar.com" />
            <p className="mt-2 text-[11px] text-[#86868B] ml-1 flex items-start gap-1">
               <svg className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
               Важно: Коды сброса пароля приходят на почту. Указывайте ваш реальный и активный Email.
            </p>
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
