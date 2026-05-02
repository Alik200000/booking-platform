"use client";

import { useState } from "react";
import { createServiceCategory, deleteServiceCategory } from "@/app/actions/categories";
import { toast } from "react-hot-toast";

interface Category {
  id: string;
  name: string;
}

export default function CategoryManager({ categories, t }: { categories: any[], t: any }) {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      await createServiceCategory(name, imageUrl || null);
      setName("");
      setImageUrl("");
      toast.success("Категория добавлена");
    } catch (err) {
      toast.error("Ошибка при добавлении");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить категорию? Услуги внутри останутся, но без категории.")) return;
    
    setLoading(true);
    try {
      await deleteServiceCategory(id);
      toast.success("Категория удалена");
    } catch (err) {
      toast.error("Ошибка при удалении");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#D3D8DF] rounded-[2rem] p-8 shadow-sm h-fit">
      <h2 className="text-xl font-medium text-[#1F2532] mb-6">Категории услуг</h2>
      
      <form onSubmit={handleAdd} className="space-y-3 mb-6">
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название (напр. Стрижки)"
          required
          className="w-full bg-[#E0E5EC] text-[#1F2532] px-4 py-3 rounded-xl border border-white/40 outline-none focus:border-[#444A5B] transition-all"
        />
        <input 
          type="url" 
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="URL фото категории"
          className="w-full bg-[#E0E5EC] text-[#1F2532] px-4 py-3 rounded-xl border border-white/40 outline-none focus:border-[#444A5B] transition-all text-sm"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#444A5B] text-white py-3.5 rounded-xl font-bold hover:bg-[#3B414F] transition-all disabled:opacity-50"
        >
          Добавить категорию
        </button>
      </form>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white/40 p-3 rounded-xl flex justify-between items-center group">
            <span className="font-bold text-[#1F2532]/80">{cat.name}</span>
            <button 
              onClick={() => handleDelete(cat.id)}
              className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 p-1.5 rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-center text-[#1F2532]/40 text-sm italic py-4">Нет категорий</p>
        )}
      </div>
    </div>
  );
}
