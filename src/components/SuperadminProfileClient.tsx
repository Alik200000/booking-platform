"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function SuperadminProfileClient({ user }: { user: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user.name);
  const [image, setImage] = useState(user.image || "");

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/superadmin/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image })
      });

      if (res.ok) {
        toast.success("Профиль обновлен!");
        router.refresh();
      } else {
        toast.error("Ошибка при сохранении");
      }
    } catch (error) {
      toast.error("Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        toast.success("Фото выбрано. Нажмите Сохранить.");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 md:space-y-10 animate-in fade-in duration-700 pb-24 md:pb-10">
      <div className="px-1 md:px-0">
        <h1 className="text-4xl md:text-[3rem] font-black tracking-tight text-[#1C1C1C]">Мой Аккаунт</h1>
        <p className="text-gray-400 font-medium text-sm mt-1">Управление учетной записью суперадмина</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-gray-100 border border-gray-100">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="relative group">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-[1.5rem] md:rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center text-3xl md:text-4xl font-black shadow-2xl shadow-indigo-200 overflow-hidden border-4 border-white">
                {image ? (
                  <img src={image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.name?.[0]
                )}
              </div>
              <button 
                onClick={() => document.getElementById('superadmin-photo-upload')?.click()}
                className="absolute -bottom-2 -right-2 bg-black text-white p-2 rounded-xl shadow-xl hover:scale-110 transition-transform"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </button>
              <input 
                type="file" 
                id="superadmin-photo-upload" 
                className="hidden" 
                accept="image/*" 
                onChange={handlePhotoUpload}
              />
            </div>

            <div className="flex-1 space-y-6 w-full text-center md:text-left">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Ваше имя</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full md:w-auto px-6 py-3 bg-gray-50 border-none rounded-xl font-bold text-xl text-[#1C1C1C] focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                />
              </div>
              <div className="pt-2 flex flex-col md:flex-row items-center gap-4 justify-center md:justify-start">
                <span className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                  {user.role}
                </span>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="px-8 py-3 bg-[#1C1C1C] text-white rounded-xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? "Сохранение..." : "Сохранить изменения"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
