"use client";

import { useState } from "react";
import { requestPayment } from "@/app/actions/billing";

export default function KaspiPaymentButton({ plan, amount, tenantId, isCurrent, isPending }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    setLoading(true);
    try {
      await requestPayment(plan.name, amount);
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const code = `PAY-${tenantId.substring(tenantId.length - 4).toUpperCase()}`;

  if (isPending) {
    return (
      <button disabled className="mt-10 w-full py-4 rounded-xl font-bold bg-amber-100 text-amber-700 cursor-not-allowed">
         Заявка на рассмотрении
      </button>
    );
  }

  return (
    <>
      <button 
        disabled={isCurrent} 
        onClick={() => setIsOpen(true)}
        className={`mt-10 w-full py-4 rounded-xl font-bold transition-all ${isCurrent ? 'bg-[#D3D8DF] text-[#1F2532]/40 cursor-not-allowed' : plan.highlight ? 'bg-[#444A5B] text-white shadow-lg hover:bg-[#3B414F] hover:-translate-y-1' : 'bg-transparent border-2 border-[#444A5B] text-[#444A5B] hover:bg-[#444A5B]/10 hover:-translate-y-1'}`}
      >
         {isCurrent ? "Текущий тариф" : "Выбрать"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F2532]/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 text-black/50">✕</button>
            
            <div className="w-16 h-16 bg-[#F14635] text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#F14635]/30">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
            </div>
            
            <h3 className="text-2xl font-bold text-[#1F2532] mb-2">Оплата через Kaspi</h3>
            <p className="text-[#1F2532]/60 font-medium mb-6">Откройте приложение Kaspi.kz и сделайте перевод по номеру телефона.</p>
            
            <div className="bg-[#F8F9FA] border border-black/5 rounded-2xl p-5 mb-6 space-y-4">
               <div>
                  <p className="text-xs font-bold uppercase text-[#1F2532]/40 tracking-wider mb-1">Номер телефона</p>
                  <p className="font-mono text-lg font-bold text-[#1F2532]">+7 707 382 92 87</p>
               </div>
               <div>
                  <p className="text-xs font-bold uppercase text-[#1F2532]/40 tracking-wider mb-1">Сумма перевода</p>
                  <p className="font-mono text-lg font-bold text-[#1F2532]">${amount}</p>
               </div>
               <div className="pt-4 border-t border-black/5">
                  <p className="text-xs font-bold uppercase text-[#F14635] tracking-wider mb-2">Важно! Укажите этот код в сообщении:</p>
                  <div className="bg-white border-2 border-dashed border-[#F14635]/30 rounded-xl py-3 text-center">
                     <p className="font-mono text-2xl font-black text-[#F14635]">{code}</p>
                  </div>
               </div>
            </div>

            {error && <div className="text-red-500 font-medium text-sm text-center mb-4">{error}</div>}

            <button 
              onClick={handlePay}
              disabled={loading}
              className="w-full bg-[#F14635] hover:bg-[#D93D2E] text-white py-4 rounded-xl font-bold shadow-lg shadow-[#F14635]/20 transition-all hover:-translate-y-1 flex justify-center"
            >
              {loading ? "Отправка..." : "Я совершил перевод"}
            </button>
            <p className="text-center text-xs font-medium text-[#1F2532]/40 mt-4">Мы активируем ваш тариф сразу после получения перевода.</p>
          </div>
        </div>
      )}
    </>
  );
}
