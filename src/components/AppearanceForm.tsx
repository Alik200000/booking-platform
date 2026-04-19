"use client";

import { useState } from "react";
import { updateAppearance } from "@/app/actions/appearance";

export default function AppearanceForm({ initialColor, initialLogo }: { initialColor: string, initialLogo: string }) {
  const [color, setColor] = useState(initialColor);
  const [logoUrl, setLogoUrl] = useState(initialLogo);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const predefinedColors = [
    "#0071E3", // Apple Blue
    "#FF2D55", // Pink
    "#5856D6", // Purple
    "#FF9500", // Orange
    "#34C759", // Green
    "#1D1D1F", // Dark
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("primaryColor", color);
    formData.append("logoUrl", logoUrl);

    const res = await updateAppearance(formData);
    
    if (res.error) {
      setMessage("❌ " + res.error);
    } else {
      setMessage("✅ Успешно сохранено!");
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-[#1F2532] mb-4">Фирменный цвет</h3>
        <div className="flex gap-4 mb-4">
          {predefinedColors.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-10 h-10 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-black/20 shadow-md' : 'hover:scale-110'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-[#1F2532]/70">Или свой HEX-код:</label>
          <input 
            type="text" 
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="px-4 py-2 rounded-xl border border-black/10 bg-white w-32 focus:ring-2 focus:ring-[#0071E3]/20 outline-none uppercase font-mono text-sm"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-black/5">
        <h3 className="text-xl font-bold text-[#1F2532] mb-4">Логотип</h3>
        <p className="text-sm text-[#1F2532]/60 mb-2">Вставьте прямую ссылку на картинку с вашим логотипом (например, из VK или Instagram).</p>
        <input 
          type="url" 
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://example.com/logo.png"
          className="w-full px-5 py-3 rounded-2xl border border-black/5 bg-white focus:ring-2 focus:ring-[#0071E3]/20 outline-none transition-all"
        />
      </div>

      <div className="pt-4 flex items-center gap-4">
        <button 
          type="submit" 
          disabled={loading}
          className="px-8 py-3 bg-[#1F2532] text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? "Сохранение..." : "Сохранить"}
        </button>
        {message && <span className="font-semibold text-sm animate-in fade-in">{message}</span>}
      </div>
    </form>
  );
}
