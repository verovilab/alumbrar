import React from 'react';
import { Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { createCheckoutSession } from '../lib/stripe';

interface PricingProps {
  userId: string;
  onClose: () => void;
}

export function Pricing({ userId, onClose }: PricingProps) {
  const plans = [
    {
      name: "Gratis",
      price: "$0",
      description: "Para comenzar tu camino",
      features: ["3 Gemas diarias", "5 mensajes al Guía/día", "Resúmenes de lecciones"],
      buttonText: "Actual",
      premium: false
    },
    {
      name: "Premium",
      price: "$9.99",
      description: "Acceso total a la luz",
      features: [
        "Gemas ilimitadas", 
        "Chat con el Guía ilimitado", 
        "Guardar Favoritos", 
        "Sin anuncios", 
        "Soporte prioritario"
      ],
      buttonText: "Ser Premium",
      premium: true,
      priceId: "price_premium_monthly"
    }
  ];

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden relative animate-scale-in">
        <button 
          onClick={onClose}
          className="absolute top-6 right-8 text-stone-300 hover:text-stone-900 transition-colors"
        >
          Cerrar
        </button>

        <div className="p-10 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-serif font-bold text-stone-900">Elige tu Plan</h2>
            <p className="text-xs text-stone-400 font-medium lowercase tracking-widest italic">Expande tu consciencia sin límites</p>
          </div>

          <div className="space-y-4">
            {plans.map((plan) => (
              <div 
                key={plan.name}
                className={`p-6 rounded-[2rem] border-2 transition-all ${plan.premium ? 'border-[#D4AF37] bg-stone-50 shadow-lg scale-[1.02]' : 'border-stone-100 opacity-60'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-stone-900">{plan.name}</h3>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-serif font-bold text-stone-900">{plan.price}</span>
                    <span className="text-[10px] text-stone-400 block">/mes</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs text-stone-600">
                      <Check size={14} className={plan.premium ? 'text-[#D4AF37]' : 'text-stone-300'} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => plan.premium && createCheckoutSession(plan.priceId!, userId)}
                  disabled={!plan.premium}
                  className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                    plan.premium 
                    ? 'bg-stone-900 text-[#D4AF37] shadow-xl hover:scale-[1.02]' 
                    : 'bg-stone-100 text-stone-400'
                  }`}
                >
                  {plan.premium && <Sparkles size={14} />}
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 pt-4 opacity-40">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Pago Seguro via Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
