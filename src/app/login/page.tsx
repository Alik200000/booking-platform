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
      if (email.toLowerCase().includes("admin") || email.toLowerCase().includes("alik")) {
        router.push("/superadmin");
      } else {
        router.push("/admin");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
         <h1 className="text-[32px] font-bold tracking-tight text-[#1D1D1F] mb-2">Вход в систему</h1>
         <p className="text-[17px] text-[#86868B]">Пожалуйста, войдите в свой аккаунт</p>
      </div>
      
      <div className="bg-white max-w-[400px] w-full p-10 rounded-[32px] shadow-sm border border-black/[0.04]">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-semibold border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[13px] font-semibold mb-2 text-[#1D1D1F] ml-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full px-5 py-4 rounded-2xl border border-black/5 bg-[#F5F5F7] text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10 outline-none transition-all font-medium placeholder:text-[#86868B]"
              placeholder="hello@salon.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold mb-2 text-[#1D1D1F] ml-1">Пароль</label>
            <input 
              type="password" 
              required
              className="w-full px-5 py-4 rounded-2xl border border-black/5 bg-[#F5F5F7] text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10 outline-none transition-all font-medium placeholder:text-[#86868B]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex justify-end mt-2">
               <Link href="/forgot-password" className="text-[13px] text-[#0071E3] hover:underline font-medium">Забыли пароль?</Link>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 mt-2 bg-[#0071E3] text-white rounded-2xl font-semibold text-[17px] hover:bg-[#0077ED] active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
          >
            {loading ? "Загрузка..." : "Войти"}
          </button>
        </form>
      </div>
      
      <p className="mt-8 text-[15px] text-[#86868B]">
        Еще нет аккаунта? <Link href="/register" className="text-[#0071E3] hover:underline">Подключить бизнес</Link>
      </p>
    </div>
  );
}
