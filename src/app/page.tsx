import Link from "next/link";
import { auth } from "@/auth";

export default async function LandingPage() {
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error("LandingPage auth error:", error);
  }


  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans text-[#1D1D1F] selection:bg-[#0071E3] selection:text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-xl border-b border-black/5 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-[#0071E3] to-[#409CFF] rounded-lg shadow-sm flex items-center justify-center text-white font-bold text-xl">S</div>
            <span className="font-bold text-xl tracking-tight">SmarterBooking</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium text-sm">
            <a href="#features" className="hover:text-[#0071E3] transition-colors">Возможности</a>
            <a href="#pricing" className="hover:text-[#0071E3] transition-colors">Тарифы</a>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <Link href={session.user.role === 'SUPERADMIN' ? '/superadmin' : '/admin'} className="text-sm font-bold hover:text-[#0071E3] transition-colors">Панель управления</Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold hover:text-[#0071E3] transition-colors hidden sm:block">Войти</Link>
                <Link href="/register" className="text-sm font-bold bg-[#0071E3] text-white px-5 py-2.5 rounded-full hover:bg-[#0077ED] transition-colors shadow-sm">Подключить бизнес</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-[3.5rem] md:text-[5.5rem] font-bold tracking-tight leading-[1.05] mb-6">
             Забудьте про блокноты.<br/>
             <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0071E3] to-[#409CFF]">Управляйте в стиле минимализм.</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-500 font-medium mb-12 max-w-2xl mx-auto">
            Онлайн-запись, встроенная CRM и автоматизация расписания в одном элегантном решении для салонов красоты.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register" className="px-8 py-4 bg-[#0071E3] text-white rounded-full font-bold text-lg hover:bg-[#0077ED] transition-all hover:scale-105 shadow-lg shadow-blue-500/20 w-full sm:w-auto">
              Начать бесплатно
            </Link>
            <a href="#features" className="px-8 py-4 bg-white text-zinc-800 border border-black/5 rounded-full font-bold text-lg hover:bg-zinc-50 transition-all w-full sm:w-auto shadow-sm">
              Узнать больше
            </a>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-24 px-6 bg-white border-y border-black/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Всё, что нужно для роста.</h2>
            <p className="text-xl text-zinc-500 font-medium">Мощные инструменты под капотом, простой интерфейс снаружи.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Calendar */}
            <div className="md:col-span-2 bg-[#F5F5F7] rounded-[2.5rem] p-10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full"></div>
               <h3 className="text-2xl font-bold mb-2 relative z-10">Умный Календарь</h3>
               <p className="text-zinc-500 font-medium w-full sm:w-2/3 relative z-10">Никаких накладок и двойных записей. Плавная сетка расписания, которая сама считает свободное время мастеров.</p>
               
               <div className="absolute bottom-[-10%] right-[-5%] w-[70%] sm:w-[60%] h-[60%] bg-white rounded-tl-3xl shadow-2xl border border-black/5 p-4 transform group-hover:-translate-y-4 group-hover:-translate-x-4 transition-transform duration-500 flex flex-col gap-3">
                 <div className="w-full h-8 bg-zinc-100 rounded-lg"></div>
                 <div className="w-3/4 h-12 bg-blue-50 text-blue-600 rounded-lg p-3 text-xs font-bold flex items-center shadow-sm">Стрижка (Иван)</div>
                 <div className="w-1/2 h-12 bg-emerald-50 text-emerald-600 rounded-lg p-3 text-xs font-bold flex items-center shadow-sm">Окрашивание (Анна)</div>
               </div>
            </div>
            
            {/* CRM */}
            <div className="bg-[#1D1D1F] text-white rounded-[2.5rem] p-10 relative overflow-hidden group">
               <h3 className="text-2xl font-bold mb-2">Своя CRM</h3>
               <p className="text-zinc-400 font-medium">Автоматический учет всех клиентов по номерам телефонов.</p>
               <div className="absolute bottom-10 left-10 right-10">
                  <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 group-hover:bg-white/20 transition-colors">
                     <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-xl">Т</div>
                     <div>
                       <p className="font-bold">Тимур</p>
                       <p className="text-sm text-white/50 font-medium">Визитов: 5</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Widget */}
            <div className="bg-[#F5F5F7] rounded-[2.5rem] p-10 relative overflow-hidden">
               <h3 className="text-2xl font-bold mb-2">Виджет Записи</h3>
               <p className="text-zinc-500 font-medium">Идеально смотрится в Instagram. 100% Mobile-first.</p>
               <div className="mt-8 flex justify-center">
                 <div className="w-40 h-48 bg-white rounded-t-3xl shadow-xl border border-black/5 p-5 flex flex-col gap-3">
                    <div className="w-full h-5 bg-zinc-100 rounded-full"></div>
                    <div className="w-full h-10 bg-[#0071E3] rounded-xl mt-2"></div>
                    <div className="w-full h-10 bg-zinc-100 rounded-xl"></div>
                 </div>
               </div>
            </div>

            {/* Client Portal */}
            <div className="md:col-span-2 bg-[#F5F5F7] rounded-[2.5rem] p-10 flex flex-col justify-center relative overflow-hidden group">
               <h3 className="text-2xl font-bold mb-2">Личный кабинет клиента</h3>
               <p className="text-zinc-500 font-medium w-full sm:w-3/4 mb-6">Ваши клиенты могут сами заходить на сайт по номеру телефона, смотреть историю стрижек и отменять записи без звонков администратору.</p>
               <div className="flex items-center gap-3 text-[#0071E3] font-bold bg-blue-500/10 self-start px-4 py-2 rounded-full">
                 <span>Вход без паролей</span>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-[#F5F5F7]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Простые тарифы.</h2>
            <p className="text-xl text-zinc-500 font-medium">Начните бесплатно, платите когда растете.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-black/5 hover:-translate-y-2 transition-transform duration-300">
                <h3 className="text-2xl font-bold mb-2">FREE</h3>
                <p className="text-zinc-500 font-medium mb-8 h-10">Для частных мастеров</p>
                <div className="mb-8"><span className="text-5xl font-black">0 ₸</span><span className="text-zinc-500 font-medium">/мес</span></div>
                <ul className="space-y-4 mb-10 h-32">
                   <li className="flex items-center font-medium"><svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> 1 мастер</li>
                   <li className="flex items-center font-medium"><svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> До 50 записей в месяц</li>
                </ul>
                <Link href="/register" className="block text-center w-full py-4 rounded-xl font-bold bg-[#F5F5F7] text-zinc-800 hover:bg-zinc-200 transition-colors">Начать бесплатно</Link>
             </div>

             <div className="bg-[#1D1D1F] text-white rounded-[2.5rem] p-10 shadow-2xl md:scale-105 z-10 hover:-translate-y-2 transition-transform duration-300 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0071E3] text-white text-xs font-bold uppercase tracking-wider inline-block px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/30">Популярный</div>
                <h3 className="text-2xl font-bold mb-2">STARTER</h3>
                <p className="text-zinc-400 font-medium mb-8 h-10">Для небольших салонов</p>
                <div className="mb-8"><span className="text-5xl font-black">25 000 ₸</span><span className="text-zinc-400 font-medium">/мес</span></div>
                <ul className="space-y-4 mb-10 h-32 text-zinc-300">
                   <li className="flex items-center font-medium"><svg className="w-5 h-5 text-[#0071E3] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> До 3 мастеров</li>
                   <li className="flex items-center font-medium"><svg className="w-5 h-5 text-[#0071E3] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> Безлимитные записи</li>
                   <li className="flex items-center font-medium"><svg className="w-5 h-5 text-[#0071E3] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> Клиентский портал</li>
                </ul>
                <Link href="/register" className="block text-center w-full py-4 rounded-xl font-bold bg-[#0071E3] text-white hover:bg-[#0077ED] transition-colors shadow-lg shadow-blue-500/20">Попробовать</Link>
             </div>

             <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-black/5 hover:-translate-y-2 transition-transform duration-300">
                <h3 className="text-2xl font-bold mb-2">PRO</h3>
                <p className="text-zinc-500 font-medium mb-8 h-10">Для сети салонов</p>
                <div className="mb-8"><span className="text-5xl font-black">45 000 ₸</span><span className="text-zinc-500 font-medium">/мес</span></div>
                <ul className="space-y-4 mb-10 h-32">
                   <li className="flex items-center font-medium"><svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> Безлимитные мастера</li>
                   <li className="flex items-center font-medium"><svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> API и Интеграции</li>
                   <li className="flex items-center font-medium"><svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> Выделенная поддержка</li>
                </ul>
                <Link href="/register" className="block text-center w-full py-4 rounded-xl font-bold bg-[#F5F5F7] text-zinc-800 hover:bg-zinc-200 transition-colors">Подключить</Link>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-black/5 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-[#0071E3] to-[#409CFF] rounded-md flex items-center justify-center text-white font-bold text-sm shadow-sm">S</div>
            <span className="font-bold tracking-tight text-zinc-800 text-lg">SmarterBooking</span>
          </div>
          <div className="flex gap-6 text-sm font-medium text-zinc-500">
             <a href="#" className="hover:text-zinc-800 transition-colors">Политика конфиденциальности</a>
             <a href="#" className="hover:text-zinc-800 transition-colors">Договор оферты</a>
          </div>
          <div className="text-zinc-400 text-sm font-medium">
             © 2026 SmarterBooking SaaS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
