import React from 'react';

export function NavBtn({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center justify-center py-2 flex-1 transition-all duration-300 relative group`}
    >
      <div className={`p-1 mb-1 transition-all duration-300 ${active ? 'text-stone-900 group-hover:scale-110' : 'text-stone-400 group-hover:text-stone-600'}`}>
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { 
          size: active ? 22 : 20,
          strokeWidth: active ? 2.5 : 2
        }) : icon}
      </div>
      <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${active ? 'text-[#D4AF37] opacity-100 translate-y-0' : 'text-stone-300 opacity-60 translate-y-1 group-hover:opacity-80 group-hover:translate-y-0'}`}>
        {label}
      </span>
      {active && (
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37]"></div>
      )}
    </button>
  );
}
