import React, { useState } from 'react';
import { Check, Sparkles, ShieldCheck, Loader2, X, Zap } from 'lucide-react';
import { createCheckoutSession, PRICE_IDS, PlanType } from '../lib/stripe';

interface PricingProps {
  userId: string;
  onClose: () => void;
}

export function Pricing({ userId, onClose }: PricingProps) {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const annualDiscount = 40; // % de descuento en plan anual
  const monthlyPrice = 9.99;
  const annualMonthlyPrice = +(monthlyPrice * (1 - annualDiscount / 100)).toFixed(2);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const planType: PlanType = billing === 'annual' ? 'premium_annual' : 'premium_monthly';
      await createCheckoutSession(PRICE_IDS[planType], planType);
      // La función redirige a Stripe, no llega al finally en éxito
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error. Intenta de nuevo.');
      setLoading(false);
    }
  };

  const freeFeatures = [
    '5 mensajes al Guía por día',
    '3 Gemas por día',
    'Resúmenes de lecciones',
    'Acceso básico al Curso',
  ];

  const premiumFeatures = [
    'Chat con el Guía ilimitado',
    'Gemas ilimitadas',
    'Guardar favoritos y frases',
    'Sonidos de meditación',
    'Sin interrupciones',
    'Soporte prioritario',
  ];

  return (
    <div
      className="fixed inset-0 bg-stone-900/50 backdrop-blur-md z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden relative animate-scale-in max-h-[92vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-stone-300 hover:text-stone-900 transition-colors rounded-full hover:bg-stone-100"
        >
          <X size={20} />
        </button>

        <div className="p-8 sm:p-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-1 pr-8">
            <h2 className="text-3xl font-serif font-bold text-stone-900">Elige tu Plan</h2>
            <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">
              Sin compromisos. Cancela cuando quieras.
            </p>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-1 bg-stone-100 p-1 rounded-full">
            <button
              onClick={() => setBilling('monthly')}
              className={`flex-1 py-2 px-4 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                billing === 'monthly'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`flex-1 py-2 px-4 rounded-full text-xs font-black uppercase tracking-wider transition-all relative ${
                billing === 'annual'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              Anual
              <span className="absolute -top-2.5 -right-1 bg-[#D4AF37] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                -{annualDiscount}%
              </span>
            </button>
          </div>

          {/* Plan Cards */}
          <div className="space-y-3">
            {/* Free */}
            <div className="p-5 rounded-[2rem] border border-stone-100 bg-stone-50 opacity-70">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-serif font-bold text-stone-700">Gratis</h3>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Plan actual</p>
                </div>
                <span className="text-xl font-bold text-stone-600">$0</span>
              </div>
              <ul className="space-y-2">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-stone-500">
                    <Check size={12} className="text-stone-300 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Premium */}
            <div className="p-5 rounded-[2rem] border-2 border-[#D4AF37] bg-stone-50 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#D4AF37] text-white text-[9px] font-black px-4 py-1.5 rounded-bl-2xl tracking-wider uppercase">
                Recomendado
              </div>
              <div className="flex justify-between items-start mb-3 pr-24">
                <div>
                  <h3 className="font-serif font-bold text-stone-900 flex items-center gap-2">
                    Premium
                    <Sparkles size={14} className="text-[#D4AF37]" />
                  </h3>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                    Acceso total
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-serif font-bold text-stone-900">
                    ${billing === 'annual' ? annualMonthlyPrice : monthlyPrice}
                  </span>
                  <span className="text-[10px] text-stone-400 block">/mes</span>
                  {billing === 'annual' && (
                    <span className="text-[10px] text-[#D4AF37] font-bold block">
                      ${(annualMonthlyPrice * 12).toFixed(2)}/año
                    </span>
                  )}
                </div>
              </div>
              <ul className="space-y-2 mb-5">
                {premiumFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-stone-700">
                    <Check size={12} className="text-[#D4AF37] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
                  {error}
                </p>
              )}

              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 bg-stone-900 text-[#D4AF37] shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Preparando pago...
                  </>
                ) : (
                  <>
                    <Zap size={14} />
                    Comenzar Premium
                    {billing === 'annual' && ' Anual'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Trust */}
          <div className="flex items-center justify-center gap-2 opacity-40">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Pago Seguro · Cancela cuando quieras
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
