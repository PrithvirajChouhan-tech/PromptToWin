import { api } from "../../services/journey";
import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, 
  Store,
  Building,
  Lock, 
  Mail, 
  User, 
  AlertCircle,
  Eye, 
  EyeOff, 
  ChevronDown, 
  ShieldCheck,
  Check
} from 'lucide-react';
import { AuthUser, UserRole } from '../../types/auth';
import { signInWithGooglePopup } from '../../services/firebaseAuth';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
  initialRole?: UserRole;
}

interface RoleOption {
  id: UserRole;
  title: string;
  badge: string;
  desc: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const ROLES: RoleOption[] = [
  {
    id: 'tourist',
    title: 'Tourist Dashboard',
    badge: 'Traveler Suite',
    desc: 'Itineraries, verified guides & safety navigation',
    icon: Compass,
    iconBg: '#E0F2FE',
    iconColor: '#0284C7'
  },
  {
    id: 'business',
    title: 'Business Dashboard',
    badge: 'Merchant Console',
    desc: 'Hotel & dining listings, footfall & reviews',
    icon: Store,
    iconBg: '#DCFCE7',
    iconColor: '#16A34A'
  },
  {
    id: 'authority',
    title: 'Authority Dashboard',
    badge: 'Official Console',
    desc: 'ASI heritage safety, telemetry & incident response',
    icon: Building,
    iconBg: '#FFE4E6',
    iconColor: '#E11D48'
  }
];

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  initialRole = 'tourist',
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Role-specific fields
  const [businessName, setBusinessName] = useState('');
  const [gstOrLicense, setGstOrLicense] = useState('');
  const [officerBadgeId, setOfficerBadgeId] = useState('');

  const currentRole = ROLES.find(r => r.id === selectedRole) || ROLES[0];
  const CurrentIcon = currentRole.icon;

  // Click outside listener for the custom dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const user = await api('/auth', { 
        email: email.trim().toLowerCase(), 
        password, 
        name: name.trim(), 
        role: selectedRole, 
        signup: isSignUp 
      });
      if (user.role !== selectedRole) { 
        setErrorMsg(`This account belongs to the ${user.role} dashboard. Please switch to ${user.role}.`); 
        return; 
      }
      onLoginSuccess(user);
    } catch (error: any) { 
      setErrorMsg(error.message || 'Authentication failed. Please verify credentials.'); 
    } finally {
      setLoading(false);
    }
  };

  // Google Authentication Handler (Firebase Popup + Platform Session)
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setGoogleLoading(true);

    try {
      let googleData: { email: string; name: string; avatar: string };

      try {
        googleData = await signInWithGooglePopup();
      } catch (popupErr: any) {
        setGoogleLoading(false);
        if (popupErr?.code === 'auth/popup-closed-by-user' || popupErr?.code === 'auth/cancelled-popup-request') {
          return;
        }
        if (popupErr?.code === 'auth/popup-blocked') {
          setErrorMsg('Google popup was blocked by your browser. Please allow popups for this site in the Chrome address bar and try again.');
          return;
        }
        if (popupErr?.code === 'auth/unauthorized-domain') {
          setErrorMsg(`Domain "${window.location.hostname}" is not authorized in Firebase. Add it to Firebase Console -> Authentication -> Settings -> Authorized domains.`);
          return;
        }
        if (popupErr?.code === 'auth/operation-not-allowed') {
          setErrorMsg('Google Sign-In is not enabled in Firebase Console. Go to Authentication -> Sign-in method and enable Google.');
          return;
        }
        if (popupErr?.code === 'auth/invalid-api-key') {
          setErrorMsg('Firebase API key is invalid. Please check VITE_FIREBASE_API_KEY in Render environment variables.');
          return;
        }

        setErrorMsg(popupErr?.message || 'Google sign-in could not be completed.');
        return;
      }

      const user = await api('/google', {
        email: googleData.email,
        name: googleData.name,
        avatar: googleData.avatar,
        role: selectedRole
      });

      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google sign-in could not be completed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Direct Demo Role Switcher
  const handleDemoSignIn = async (role: UserRole) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const demo = await api('/demo', { role });
      onLoginSuccess(demo);
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#EDF2F7] text-[#0F172A] flex flex-col justify-between font-sans relative selection:bg-[#C84B31]/20 selection:text-[#C84B31]">
      
      {/* Background Dot-Grid Texture for Crisp Contrast with Card */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Header Bar */}
      <header className="w-full border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md py-3.5 px-4 sm:px-8 z-10 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#C84B31] text-white flex items-center justify-center font-bold shadow-xs">
              <Compass className="w-4 h-4 stroke-[2.4]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-[#0F172A]">Yatra One</span>
              <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-mono uppercase tracking-wider">
                Official Tourism Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="hidden sm:inline font-medium">SSL Encrypted Session</span>
          </div>
        </div>
      </header>

      {/* Main Container - Same Sized Card in All Dashboards */}
      <main className="flex-1 w-full max-w-[430px] mx-auto px-4 py-8 sm:py-10 flex flex-col justify-center z-10">
        
        {/* Pure White Card with Strong Depth & Visual Separation from Background */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.12),0_0_0_1px_rgba(15,23,42,0.03)] p-6 sm:p-7 space-y-4 transition-all">
          
          {/* Card Title & Dynamic Dashboard Subheading */}
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
              {isSignUp ? `Create account for ${currentRole.title}` : `Sign in to ${currentRole.title}`}
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              {currentRole.desc}
            </p>
          </div>

          {/* CREATIVE BESPOKE DASHBOARD SWITCHER DROPDOWN */}
          <div className="space-y-1.5 relative" ref={dropdownRef}>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Switch Dashboard</span>
              <span className="text-[10px] text-slate-400 font-normal">Select portal</span>
            </label>

            {/* Custom Trigger Button */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-[#F8FAFC] hover:bg-slate-100/80 border border-[#CBD5E1] hover:border-slate-400 rounded-2xl p-2.5 px-3 flex items-center justify-between transition-all cursor-pointer shadow-2xs group text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div 
                  className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                  style={{ backgroundColor: currentRole.iconBg }}
                >
                  <CurrentIcon className="w-4 h-4" style={{ color: currentRole.iconColor }} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#0F172A] leading-tight truncate">
                    {currentRole.title}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {currentRole.badge}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white text-slate-600 border-slate-200 hidden sm:inline">
                  Change
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180 text-[#C84B31]' : ''
                }`} />
              </div>
            </button>

            {/* Creative Dropdown Popover Menu */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-white rounded-2xl border border-slate-200 shadow-2xl p-1.5 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        setSelectedRole(role.id);
                        setIsDropdownOpen(false);
                        setErrorMsg(null);
                      }}
                      className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#F8FAFC] border border-slate-200 shadow-2xs' 
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div 
                          className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                          style={{ backgroundColor: role.iconBg }}
                        >
                          <Icon className="w-4 h-4" style={{ color: role.iconColor }} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#0F172A] truncate">
                              {role.title}
                            </span>
                            <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {role.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {role.desc}
                          </p>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full bg-[#C84B31] text-white flex items-center justify-center shrink-0 ml-2">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Official Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#1E293B] font-semibold text-xs flex items-center justify-center gap-3 transition-all shadow-xs active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            {/* Google 4-Color SVG Icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{googleLoading ? 'Connecting to Google…' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-[#E2E8F0]" />
            <span className="absolute bg-white px-3 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              or continue with email
            </span>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            
            {/* If Sign Up: Name field */}
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C84B31] focus:bg-white transition-colors"
                />
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email Address</span>
                </span>
                {selectedRole === 'authority' && (
                  <span className="text-[10px] text-amber-600 font-mono">Government Domain (.gov.in)</span>
                )}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  selectedRole === 'tourist'
                    ? 'traveler@gmail.com'
                    : selectedRole === 'business'
                    ? 'merchant@hotelheritage.in'
                    : 'officer@tourism.gov.in'
                }
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C84B31] focus:bg-white transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Password</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C84B31] focus:bg-white transition-colors"
              />
            </div>

            {/* Business Specific Registration Fields */}
            {selectedRole === 'business' && isSignUp && (
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Business Name"
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0F172A] placeholder-slate-400"
                />
                <input
                  type="text"
                  value={gstOrLicense}
                  onChange={(e) => setGstOrLicense(e.target.value)}
                  placeholder="GSTIN / Trade Lic"
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0F172A] placeholder-slate-400"
                />
              </div>
            )}

            {/* Authority Badge ID */}
            {selectedRole === 'authority' && (
              <div className="pt-0.5">
                <input
                  type="text"
                  value={officerBadgeId}
                  onChange={(e) => setOfficerBadgeId(e.target.value)}
                  placeholder="Officer Badge ID (e.g. ASI-DEL-441)"
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] placeholder-slate-400"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#C84B31] hover:bg-[#B33E26] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-50"
            >
              <span>
                {loading 
                  ? 'Verifying…' 
                  : isSignUp 
                  ? `Create ${currentRole.title} Account` 
                  : `Sign In to ${currentRole.title}`}
              </span>
            </button>
          </form>

          {/* Sign In & Register Link at End of Card Above Demos */}
          <div className="pt-2 text-center text-xs text-slate-600">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); setErrorMsg(null); }}
                  className="text-[#C84B31] hover:text-[#A73B24] font-bold underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); setErrorMsg(null); }}
                  className="text-[#C84B31] hover:text-[#A73B24] font-bold underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Register
                </button>
              </>
            )}
          </div>

          {/* Quick Demo Access Bar */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Explore Demo:</span>
            <div className="flex items-center gap-1.5">
              {(['business', 'authority'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleDemoSignIn(r)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#E2E8F0] bg-white/80 py-3 px-4 text-center text-[11px] text-slate-500 z-10">
        Yatra One • Ministry of Tourism & ASI Digital Protocol • All Rights Reserved
      </footer>
    </div>
  );
};
