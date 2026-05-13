import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function SuperadminProfilePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPERADMIN") redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) redirect("/login");

  return (
    <div className="max-w-4xl mx-auto space-y-8 md:space-y-10 animate-in fade-in duration-700 pb-24 md:pb-10">
      <div className="px-1 md:px-0">
        <h1 className="text-4xl md:text-[3rem] font-black tracking-tight text-[#1C1C1C]">Мой Аккаунт</h1>
        <p className="text-gray-400 font-medium text-sm mt-1">Управление учетной записью суперадмина</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-gray-100 border border-gray-100">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[1.5rem] md:rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center text-3xl md:text-4xl font-black shadow-2xl shadow-indigo-200">
              {user.name?.[0]}
            </div>
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Имя администратора</label>
                <p className="text-xl md:text-2xl font-black text-[#1C1C1C] mt-1">{user.name}</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Электронная почта</label>
                <p className="text-base md:text-lg font-bold text-gray-600">{user.email}</p>
              </div>
              <div className="pt-2 flex justify-center md:justify-start">
                <span className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-100 border border-gray-50 space-y-6">
             <h3 className="text-xl font-black text-[#1C1C1C]">Безопасность</h3>
             <p className="text-sm text-gray-400 font-medium leading-relaxed">
               Для смены пароля или настройки двухфакторной аутентификации суперадмина, пожалуйста, используйте консоль управления базой данных или обратитесь к техническому регламенту платформы.
             </p>
             <button disabled className="px-8 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest">
               Сменить пароль
             </button>
          </div>

          <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-100 border border-gray-50 space-y-6">
             <h3 className="text-xl font-black text-[#1C1C1C]">Статус аккаунта</h3>
             <div className="flex items-center gap-4">
                <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-bold text-gray-700">Активен (Владелец)</span>
             </div>
             <p className="text-sm text-gray-400 font-medium leading-relaxed">
               Ваш аккаунт имеет наивысший уровень доступа ко всем функциям системы ZENO.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
