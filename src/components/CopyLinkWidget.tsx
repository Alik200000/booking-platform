"use client";
import { useState, useEffect } from "react";

export default function CopyLinkWidget({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const link = `${origin}/${slug}`;

  return (
    <div className="bg-[#E8F2FC] border border-[#0071E3]/20 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between mb-8 shadow-sm">
      <div className="flex items-center mb-4 sm:mb-0">
        <div className="w-12 h-12 bg-[#0071E3]/10 text-[#0071E3] rounded-full flex items-center justify-center mr-4 shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
        </div>
        <div>
          <p className="text-[#1D1D1F] font-bold text-sm mb-0.5">Ссылка для ваших клиентов</p>
          <a href={link} target="_blank" className="text-[#0071E3] font-medium text-[15px] hover:underline break-all">{link}</a>
        </div>
      </div>
      <button 
        onClick={() => {
          navigator.clipboard.writeText(link);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="px-6 py-3 bg-white text-[#0071E3] text-sm font-bold rounded-xl shadow-sm border border-black/5 hover:bg-[#F5F5F7] transition-all active:scale-95 shrink-0"
      >
        {copied ? "Скопировано!" : "Скопировать ссылку"}
      </button>
    </div>
  );
}
