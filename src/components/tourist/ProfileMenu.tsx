import React,{useEffect,useRef,useState} from 'react';
import {UserRound,LogOut,ArrowUpRight,Sparkles} from 'lucide-react';
import './tourist.css';
export function ProfileMenu({
  name,
  avatar,
  onViewProfile,
  onOpenSuperCard,
  onLogout
}: {
  name: string;
  avatar?: string;
  onViewProfile: () => void;
  onOpenSuperCard?: () => void;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  return (
    <div ref={root} className="tourist-profile-menu">
      <button
        ref={button}
        className="tourist-avatar relative overflow-hidden"
        aria-label="Profile menu"
        aria-expanded={open}
        aria-controls="tourist-profile-popover"
        onClick={() => setOpen(!open)}
      >
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-[13px]"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <UserRound size={20} />
        )}
      </button>

      {open && (
        <div id="tourist-profile-popover" className="tourist-profile-popover">
          <div className="flex items-center gap-2.5 pb-2.5 mb-2 border-b border-[#EAE5DC]">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border border-[#C84B31]/30 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#C84B31]/10 text-[#C84B31] flex items-center justify-center shrink-0">
                <UserRound size={18} />
              </div>
            )}
            <div className="min-w-0">
              <strong className="block truncate text-xs text-[#1F1C18]">{name}</strong>
              <small className="text-[10px] text-[#8C827A] block truncate">Traveller Account</small>
            </div>
          </div>

          <button onClick={() => { setOpen(false); onViewProfile(); }}>
            <UserRound size={17} />
            <span>View Profile</span>
            <ArrowUpRight size={15} />
          </button>
          {onOpenSuperCard && (
            <button onClick={() => { setOpen(false); onOpenSuperCard(); }} className="text-[#183E35] font-bold">
              <Sparkles size={17} className="text-[#C84B31]" />
              <span>SUPER Card</span>
              <ArrowUpRight size={15} />
            </button>
          )}
          <button onClick={() => { setOpen(false); onLogout(); }}>
            <LogOut size={17} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
