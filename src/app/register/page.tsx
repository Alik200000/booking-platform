"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerClient } from "@/app/actions/client-auth";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerClient(formData);
      
      // Auto login after registration
      const res = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (res?.error) {
        router.push("/login?registered=true");
      } else {
        router.push("/client");
      }
    } catch (err: any) {
      setError(err.message || "Ошибка при регистрации");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col justify-center items-center p-6">
      <div className="mb-10 text-center">
         <h1 className="text-4xl font-black text-[#1D1D1F] tracking-tight mb-2">Создать аккаунт</h1>
         <p className="text-[#86868B] font-medium">Станьте частью сообщества Zapis Online</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-black/5 border border-black/5">
        <div className="mb-10 bg-blue-50/50 rounded-3xl p-4 border border-blue-100/50">
           <p className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] mb-2 text-center">Вы владелец бизнеса?</p>
           <button 
             type="button"
             onClick={() => router.push("/admin/setup")}
             className="flex items-center justify-center gap-3 w-full bg-white border-2 border-blue-600/10 py-3 rounded-2xl text-blue-600 font-bold text-sm hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-sm"
           >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m4 0h1m-5 10h1m4 0h1m-5-4h1m4 0h1"></path></svg>
              Создать бизнес-аккаунт
           </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-[#86868B] uppercase tracking-widest mb-2 px-1">Ваше имя</label>
            <input 
              required
              type="text" 
              placeholder="Алимжан"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-[#F5F5F7] border-none rounded-2xl px-6 py-4 font-bold text-[#1D1D1F] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#86868B] uppercase tracking-widest mb-2 px-1">Email</label>
            <input 
              required
              type="email" 
              placeholder="hello@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-[#F5F5F7] border-none rounded-2xl px-6 py-4 font-bold text-[#1D1D1F] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#86868B] uppercase tracking-widest mb-2 px-1">WhatsApp номер</label>
            <input 
              required
              type="tel" 
              placeholder="+7 (707) 000-00-00"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-[#F5F5F7] border-none rounded-2xl px-6 py-4 font-bold text-[#1D1D1F] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#86868B] uppercase tracking-widest mb-2 px-1">Придумайте пароль</label>
            <input 
              required
              type="password" 
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-[#F5F5F7] border-none rounded-2xl px-6 py-4 font-bold text-[#1D1D1F] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
            />
          </div>

          {error && <p className="text-rose-500 text-xs font-bold text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Создаем..." : "Зарегистрироваться"}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-black/5 text-center">
          <p className="text-[#86868B] font-medium text-sm">
            Уже есть аккаунт? <Link href="/login" className="text-blue-600 font-bold hover:underline">Войти</Link>
          </p>
        </div>
      </div>
      
      <p className="mt-8 text-[11px] text-[#86868B] font-medium">
        Регистрируясь, вы соглашаетесь с правилами платформы
      </p>
    </div>
  );
}
