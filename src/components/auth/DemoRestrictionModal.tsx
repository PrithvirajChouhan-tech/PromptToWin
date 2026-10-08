import React from 'react';
import { Lock, Sparkles, ShieldAlert, ArrowRight, X, Compass, CheckCircle2 } from 'lucide-react';

interface DemoRestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  feature?: string;
  description?: string;
}

export const DemoRestrictionModal: React.FC<DemoRestrictionModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  feature = 'This Feature',
  description,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Demo Mode Restriction"
        className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border border-[#EAE5DC] relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F5F2EB] hover:bg-[#EAE5DC] text-[#665E55] hover:text-[#1F1C18] flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Top Header Badge & Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20 shrink-0">
            <Lock size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/50">
              Demo Account Limitation
            </span>
            <h2 className="text-base sm:text-lg font-black text-[#1F1C18] mt-0.5 leading-tight">
              {feature} is Locked
            </h2>
          </div>
        </div>

        {/* Description Text */}
        <p className="text-xs sm:text-sm text-[#554E46] leading-relaxed mb-4">
          {description ||
            `To access ${feature}, please sign in or create a free account. Demo accounts are limited to browsing mode without live cloud synchronization.`}
        </p>

        {/* Benefits Checklist */}
        <div className="bg-[#FAF8F5] rounded-2xl p-3.5 sm:p-4 border border-[#EAE5DC] mb-5 space-y-2">
          <div className="text-[11px] font-black text-[#183E35] uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <Sparkles size={13} className="text-amber-500" />
            <span>Unlocked with Free Account</span>
          </div>

          <div className="space-y-1.5 text-xs text-[#2A2621]">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#10B981] shrink-0" />
              <span>Full real-time GPS turn-by-turn navigation & alerts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#10B981] shrink-0" />
              <span>Unlimited custom AI multi-day trip generation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#10B981] shrink-0" />
              <span>Direct 112 emergency liaison & verified Sahayak dispatch</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#10B981] shrink-0" />
              <span>Verified ASI monument entry & certified guide booking</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              onClose();
              onLogin();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#183E35] to-[#244D40] hover:from-[#112F28] hover:to-[#183E35] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#183E35]/25 transition-all cursor-pointer active:scale-[0.99]"
          >
            <span>Sign In or Register Free</span>
            <ArrowRight size={15} className="stroke-[2.5]" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-[#665E55] hover:text-[#1F1C18] hover:bg-[#FAF8F5] transition-colors cursor-pointer text-center"
          >
            Continue in Demo Mode
          </button>
        </div>
      </div>
    </div>
  );
};
