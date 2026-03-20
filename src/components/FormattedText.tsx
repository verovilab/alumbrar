import React from 'react';

export function FormattedText({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="space-y-4">
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;
        const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
        return (
          <p key={i} className="leading-relaxed text-[15px]">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="font-bold text-stone-900">{part.slice(2, -2)}</strong>;
              }
              if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={j} className="italic text-stone-600">{part.slice(1, -1)}</em>;
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
}
