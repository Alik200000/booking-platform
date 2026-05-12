"use client";

import { useState, useEffect } from "react";
import { updateTenantAppearance } from "@/app/actions/tenant";
import { toast } from "react-hot-toast";

export default function AppearancePage() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("Алматы");
  const [primaryColor, setPrimaryColor] = useState("#0071E3");
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [plan, setPlan] = useState("FREE");


  // Fetch current settings on load
  useEffect(() => {
    async function fetchSettings() {
       const res = await fetch('/api/tenant/settings');
       if (res.ok) {
          const data = await res.json();
          setName(data.name || "");
          setCity(data.city || "Алматы");
          setPrimaryColor(data.primaryColor || "#0071E3");
          setLogoUrl(data.logoUrl || "");
          setPlan(data.subscription?.plan || "FREE");
       }
    }
    fetchSettings();
  }, []);


  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      await updateTenantAppearance({ name, city, primaryColor, logoUrl });
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
  
  const isLogoLocked = plan === "FREE";
  const isColorLocked = plan === "FREE" || plan === "STARTER";



  return (
    <div className="min-h-screen bg-[#1F2532] text-white p-4 md:p-10 pb-32 md:pb-10">
      <header className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2 bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
          Профиль бизнеса
        </h1>
        <p className="text-white/40 font-medium uppercase tracking-[0.2em] text-xs">
          God Mode: Управление брендом и данными вашего заведения
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Settings Panel */}
        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
          <section className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-white">
              <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">🏢</span>
              Основная информация
            </h2>

            <div className="space-y-6">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 px-1">Название заведения</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Например: Elite Beauty Spa"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-blue-500 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 px-1">Город</label>
                    <select 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-blue-500 transition-all appearance-none"
                    >
                      <option value="Алматы" className="bg-[#1F2532]">Алматы</option>
                      <option value="Астана" className="bg-[#1F2532]">Астана</option>
                      <option value="Шымкент" className="bg-[#1F2532]">Шымкент</option>
                    </select>
                  </div>
               </div>

               <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 px-1">Фирменный цвет</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
                    {colors.map(c => (
                      <button 
                        key={c.value}
                        onClick={() => !isColorLocked && setPrimaryColor(c.value)}
                        className={`h-12 rounded-2xl border-4 transition-all duration-300 ${primaryColor === c.value ? 'border-white scale-110 shadow-lg' : 'border-transparent'} ${isColorLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}

                </div>
              </div>

                <div className="relative">
                  {isLogoLocked && (
                    <div className="absolute inset-0 z-10 bg-[#1F2532]/60 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center border border-white/5">
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Требуется тариф STARTER</p>
                       <a href="/admin/billing" className="text-[10px] font-black text-blue-400 hover:underline">Улучшить тариф →</a>
                    </div>
                  )}
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 px-1">Логотип / Фото</label>
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                     <div className="w-24 h-24 rounded-[2rem] bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {logoUrl ? (
                           <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                           <span className="text-3xl font-black text-white/10">{name ? name[0] : 'S'}</span>
                        )}
                     </div>
                     <div className="flex-1 w-full space-y-3">
                        <input 
                          type="text" 
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          disabled={isLogoLocked}
                          placeholder="Вставьте ссылку на логотип (PNG/JPG)"
                          className={`w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-blue-500 transition-all ${isLogoLocked ? 'cursor-not-allowed' : ''}`}
                        />
                        <p className="text-[10px] text-white/20 font-medium px-1">Рекомендуется квадратное изображение высокого качества</p>
                     </div>
                  </div>
                </div>

              <button 
                onClick={handleSave}
                disabled={loading}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black uppercase tracking-[0.2em] text-xs rounded-3xl shadow-xl shadow-blue-900/20 transition-all active:scale-[0.98] mt-4"
              >
                {loading ? "Сохранение..." : "Сохранить профиль"}
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
            <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-white">
              <span className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">📱</span>
              Предпросмотр
            </h2>

            <div className="bg-[#F5F5F7] rounded-[3rem] overflow-hidden shadow-2xl scale-95 origin-top border-8 border-black shadow-black/20">
               <div className="p-10 text-center border-b border-black/5 bg-white">
                  <div className="w-20 h-20 rounded-[2rem] mx-auto mb-6 flex items-center justify-center shadow-lg border border-black/5 overflow-hidden bg-white">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-zinc-800">{name ? name[0] : 'S'}</span>
                    )}
                  </div>
                  <h3 className="text-zinc-900 font-black text-2xl tracking-tight">{name || "Ваш Салон"}</h3>
                  <p className="text-zinc-400 font-bold text-xs uppercase tracking-widest mt-1">{city}</p>
               </div>
               
               <div className="p-10 space-y-4 bg-white">
                  <div className="flex gap-2 mb-8">
                    <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: primaryColor }} />
                    <div className="h-1.5 flex-1 bg-zinc-100 rounded-full" />
                    <div className="h-1.5 flex-1 bg-zinc-100 rounded-full" />
                  </div>
                  <div className="h-14 w-full bg-zinc-50 rounded-2xl border border-black/5" />
                  <div className="h-14 w-full bg-zinc-50 rounded-2xl border border-black/5" />
                  <button 
                    className="w-full py-5 rounded-[1.5rem] text-white font-black uppercase tracking-widest text-xs shadow-xl transition-all mt-6"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Записаться
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
