"use client";

import { useState, useEffect } from "react";
import { updateTenantAppearance } from "@/app/actions/tenant";
import { toast } from "react-hot-toast"; // I should check if toast is available, if not I'll use a custom notification

export default function AppearancePage() {
  const [primaryColor, setPrimaryColor] = useState("#0071E3");
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Mock initial fetch or passed via props would be better, but for simplicity:
  useEffect(() => {
    // In a real app, we'd fetch current settings here
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      await updateTenantAppearance({ primaryColor, logoUrl });
      setMessage("Настройки успешно сохранены!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Ошибка при сохранении");
    } finally {
      setLoading(false);
    }
  };

  const colors = [
    { name: "Classic Blue", value: "#0071E3" },
    { name: "Premium Black", value: "#1F2532" },
    { name: "Luxury Gold", value: "#D4AF37" },
    { name: "Emerald Green", value: "#10B981" },
    { name: "Soft Pink", value: "#EC4899" },
    { name: "Sunset Orange", value: "#F59E0B" },
  ];

  return (
    <div className="min-h-screen bg-[#1F2532] text-white p-4 md:p-10 pb-32 md:pb-10">
      <header className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2 bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
          Внешний вид
        </h1>
        <p className="text-white/40 font-medium uppercase tracking-[0.2em] text-xs">
          God Mode: Брендирование вашего бизнеса
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Settings Panel */}
        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
          <section className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">🎨</span>
              Фирменный стиль
            </h2>

            <div className="space-y-8">
              {/* Color Picker */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-4">Основной цвет</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
                  {colors.map(c => (
                    <button 
                      key={c.value}
                      onClick={() => setPrimaryColor(c.value)}
                      className={`h-12 rounded-2xl border-4 transition-all duration-300 ${primaryColor === c.value ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none"
                  />
                  <input 
                    type="text" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-mono w-full outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Logo URL */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-4">Ссылка на логотип</label>
                <input 
                  type="text" 
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-white/20 outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <button 
                onClick={handleSave}
                disabled={loading}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black uppercase tracking-[0.2em] text-xs rounded-3xl shadow-xl shadow-blue-900/20 transition-all active:scale-[0.98]"
              >
                {loading ? "Сохранение..." : "Сохранить изменения"}
              </button>
              
              {message && (
                <p className="text-center text-sm font-bold text-emerald-400 animate-bounce">{message}</p>
              )}
            </div>
          </section>
        </div>

        {/* Live Preview Panel */}
        <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 sticky top-10">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">📱</span>
              Предпросмотр (Клиентская часть)
            </h2>

            <div className="bg-[#F5F5F7] rounded-[2rem] overflow-hidden shadow-2xl scale-90 -mt-10 origin-top">
               <div className="p-8 text-center border-b border-black/5">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center shadow-sm border border-black/5 overflow-hidden" style={{ backgroundColor: '#fff' }}>
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-zinc-800">S</span>
                    )}
                  </div>
                  <h3 className="text-zinc-900 font-bold text-lg">Ваш Салон</h3>
                  <div className="w-12 h-1 bg-zinc-200 mx-auto mt-4 rounded-full" />
               </div>
               
               <div className="p-8 space-y-4">
                  <div className="flex gap-1 mb-6">
                    <div className="h-1 flex-1 rounded-full" style={{ backgroundColor: primaryColor }} />
                    <div className="h-1 flex-1 bg-zinc-200 rounded-full" />
                    <div className="h-1 flex-1 bg-zinc-200 rounded-full" />
                  </div>
                  <div className="h-12 w-full bg-zinc-100 rounded-xl" />
                  <div className="h-12 w-full bg-zinc-100 rounded-xl" />
                  <div className="h-12 w-full bg-zinc-100 rounded-xl" />
                  <button 
                    className="w-full py-4 rounded-2xl text-white font-bold shadow-lg transition-all"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Записаться
                  </button>
               </div>
            </div>
            
            <p className="text-center text-white/30 text-xs font-medium mt-4">
              Это пример того, как увидят страницу ваши клиенты
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
