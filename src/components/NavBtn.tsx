import React from 'react';

export function NavBtn({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  const textColor = active ? "text-stone-900" : "text-stone-300";
  const btnStyle = active ? "bg-stone-900 text-[#D4AF37] shadow-lg scale-110" : "bg-transparent";
  
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all duration-300 ${textColor}`}>
      <div className={`p-3 rounded-2xl transition-all ${btnStyle}`}>
        {icon}
      </div>
      <span className={`text-[9px] font-black uppercase tracking-widest ${active ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}>
        {label}
      </span>
    </button>
  );
}
