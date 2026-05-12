"use client";

import Link from "next/link";

interface PaywallProps {
  title: string;
  description: string;
  planNeeded: "STARTER" | "PRO" | "PREMIUM";
  children?: React.ReactNode;
}

export default function Paywall({ title, description, planNeeded, children }: PaywallProps) {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-dashed border-[#1F2532]/20 p-12 text-center bg-white/50 backdrop-blur-sm group">
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 bg-[#1F2532] rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-[#1F2532]/20 group-hover:scale-110 transition-transform duration-500">
           <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
           </svg>
        </div>
        
        <h2 className="text-3xl font-serif text-[#1F2532] mb-3">{title}</h2>
        <p className="text-[#1F2532]/60 max-w-md mx-auto mb-10 leading-relaxed font-medium">
          {description}
        </p>

        <Link 
          href="/admin/billing"
          className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-2xl hover:shadow-indigo-500/30 transition-all active:scale-95"
        >
          Перейти на тариф {planNeeded}
        </Link>
      </div>

      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-50"></div>
    </div>
  );
}
