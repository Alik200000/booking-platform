"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Декорация */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "2s" }}></div>
      
      <div className="glass max-w-md w-full p-8 rounded-3xl z-10 transition-transform duration-500 hover:shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">Вход в систему</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-xl text-sm text-center font-medium border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
              placeholder="owner@salon.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Пароль</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? "Загрузка..." : "Войти"}
          </button>
          
          <div className="text-center pt-4 text-sm text-gray-500 dark:text-gray-400">
            Еще нет аккаунта? <a href="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Подключить салон</a>
          </div>
        </form>
      </div>
    </div>
  );
}
