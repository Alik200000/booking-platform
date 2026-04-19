"use client";

import { useState } from "react";
import { registerBusiness } from "@/app/actions/auth";

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
    // В случае успеха произойдет redirect внутри Server Action
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="glass max-w-lg w-full p-10 rounded-3xl z-10 hover-lift">
        <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Подключить салон</h2>
        <p className="text-gray-500 mb-8">Создайте аккаунт и начните принимать записи онлайн.</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-600 rounded-xl text-sm font-medium border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Название салона</label>
              <input name="name" type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="Beauty Bar" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">URL страницы</label>
              <input name="slug" type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="beauty-bar" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Ваш Email (Логин)</label>
            <input name="email" type="email" required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="owner@beautybar.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Пароль</label>
            <input name="password" type="password" required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition disabled:opacity-70 mt-4">
            {loading ? "Создание..." : "Зарегистрировать бизнес"}
          </button>
        </form>
      </div>
    </div>
  );
}
