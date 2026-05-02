"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/app/actions/auth";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setError("Токен отсутствует");
      return;
    }
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await resetPassword(token, password);
      if (res.success) {
        alert("Пароль успешно изменен!");
        router.push("/login");
      } else {
        setError(res.error || "Ошибка при смене пароля");
      }
    } catch (err) {
      setError("Что-то пошло не так");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-red-500 font-bold mb-4">Неверная ссылка для сброса пароля.</p>
        <Link href="/login" className="text-[#0071E3] hover:underline">Вернуться войти</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}
      
      <div>
        <label className="block text-[13px] font-semibold mb-2 text-[#1D1D1F] ml-1">Новый пароль</label>
        <input 
          type="password" 
          required 
          className="w-full px-5 py-4 rounded-2xl border border-black/5 bg-[#F5F5F7] text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10 outline-none transition-all font-medium" 
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-[13px] font-semibold mb-2 text-[#1D1D1F] ml-1">Подтвердите пароль</label>
        <input 
          type="password" 
          required 
          className="w-full px-5 py-4 rounded-2xl border border-black/5 bg-[#F5F5F7] text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10 outline-none transition-all font-medium" 
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-4 bg-[#0071E3] text-white rounded-2xl font-semibold text-[17px] hover:bg-[#0077ED] active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
      >
        {loading ? "Сохранение..." : "Обновить пароль"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
         <h1 className="text-[32px] font-bold tracking-tight text-[#1D1D1F] mb-2">Новый пароль</h1>
         <p className="text-[17px] text-[#86868B] max-w-[300px] mx-auto leading-snug">Придумайте надежный пароль для вашего аккаунта.</p>
      </div>

      <div className="bg-white max-w-[400px] w-full p-10 rounded-[32px] shadow-sm border border-black/[0.04]">
        <Suspense fallback={<p className="text-center">Загрузка...</p>}>
           <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
