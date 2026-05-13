"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Неверный email или пароль");
      setLoading(false);
    } else {
      // Получаем актуальную сессию, чтобы узнать роль пользователя
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      
      if (session?.user?.role === "SUPERADMIN") {
        router.push("/superadmin");
      } else if (session?.user?.role === "OWNER" || session?.user?.role === "STAFF") {
        router.push("/admin");
      } else {
        router.push("/client");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col justify-center items-center p-6">
      <div className="mb-12 text-center">
         <h1 className="text-5xl font-black text-[#1D1D1F] tracking-tight mb-3">С возвращением</h1>
         <p className="text-[#86868B] font-medium text-lg italic">Войдите в свой аккаунт Zapis Online</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-[3rem] p-10 sm:p-14 shadow-2xl shadow-black/5 border border-black/5">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[11px] font-black text-[#86868B] uppercase tracking-[0.2em] mb-3 px-1">Email или телефон</label>
            <input 
              required
              type="text" 
              placeholder="hello@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F5F5F7] border-none rounded-2xl px-7 py-5 font-bold text-[#1D1D1F] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-lg" 
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3 px-1">
              <label className="block text-[11px] font-black text-[#86868B] uppercase tracking-[0.2em]">Пароль</label>
              <Link href="/forgot-password" title="Восстановить пароль" className="text-[11px] font-bold text-blue-600 hover:underline">Забыли?</Link>
            </div>
            <input 
              required
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F5F5F7] border-none rounded-2xl px-7 py-5 font-bold text-[#1D1D1F] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-lg" 
            />
          </div>

          {error && <p className="text-rose-500 text-xs font-bold text-center animate-bounce">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-6 bg-blue-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Входим..." : "Войти в кабинет"}
          </button>
        </form>

        <div className="mt-12 pt-10 border-t border-black/5 space-y-6 text-center">
          <p className="text-[#86868B] font-medium text-sm">
            Нет аккаунта? <Link href="/register" className="text-blue-600 font-bold hover:underline">Создать сейчас</Link>
          </p>
          <div className="h-px w-12 bg-black/5 mx-auto"></div>
          <Link href="/setup" className="inline-block text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
            Подключить свой бизнес →
          </Link>
        </div>
      </div>
      
      <p className="mt-10 text-[11px] text-[#86868B] font-medium uppercase tracking-[0.1em]">
        © 2026 Zapis Online Platform
      </p>
    </div>
  );
}
