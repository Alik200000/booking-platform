import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ClientProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-black text-[#1D1D1F] tracking-tight">Профиль</h1>
        <p className="text-[#86868B] font-medium mt-2">Ваши личные данные и настройки</p>
      </header>

      <div className="bg-white rounded-[2.5rem] p-8 border border-black/5 space-y-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-[#F5F5F7] rounded-[2rem] flex items-center justify-center text-2xl border border-black/5">
             👤
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1D1D1F]">{session.user.name}</h3>
            <p className="text-[#86868B] font-medium">{session.user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
           <button className="w-full text-left p-4 rounded-2xl bg-[#F5F5F7] hover:bg-[#E5E5EA] transition-colors flex justify-between items-center group">
              <span className="font-bold text-[#1D1D1F]">Изменить имя</span>
              <svg className="w-5 h-5 text-[#86868B] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
           </button>
           <button className="w-full text-left p-4 rounded-2xl bg-[#F5F5F7] hover:bg-[#E5E5EA] transition-colors flex justify-between items-center group">
              <span className="font-bold text-[#1D1D1F]">Уведомления</span>
              <svg className="w-5 h-5 text-[#86868B] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
           </button>
           <button className="w-full text-left p-4 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors font-bold mt-4">
              Выйти из аккаунта
           </button>
        </div>
      </div>
    </div>
  );
}
