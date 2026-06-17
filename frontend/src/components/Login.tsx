import React, { useState } from 'react';
import { 
  signInWithPopup, GoogleAuthProvider, signOut, 
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  RecaptchaVerifier, signInWithPhoneNumber
} from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { Key, Mail, Phone, X } from 'lucide-react';

const googleProvider = new GoogleAuthProvider();

export const Login: React.FC = () => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<'google' | 'email' | 'phone'>('google');

  // Email/Password States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Phone Auth States
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      await signInWithPopup(auth, googleProvider);
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      console.error(err);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setError(null);

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
      console.error(err);
    }
  };

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved
          },
          'expired-callback': () => {
            if ((window as any).recaptchaVerifier) {
              (window as any).recaptchaVerifier.clear();
              (window as any).recaptchaVerifier = null;
            }
          }
        });
      } catch (err) {
        console.error('reCAPTCHA init error:', err);
      }
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    setError(null);
    setIsSendingCode(true);

    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber.trim(), appVerifier);
      setConfirmationResult(confirmation);
    } catch (err: any) {
      setError(err.message || 'Failed to send SMS code.');
      console.error(err);
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || !confirmationResult) return;
    setError(null);
    setIsVerifyingCode(true);

    try {
      await confirmationResult.confirm(otp.trim());
      setIsOpen(false);
      setConfirmationResult(null);
      setOtp('');
    } catch (err: any) {
      setError(err.message || 'Invalid SMS verification code.');
      console.error(err);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-2 border border-zinc-900/60 bg-zinc-950/30 px-2 py-1 rounded-sm">
        {user.photoURL && (
          <img src={user.photoURL} alt="Profile" className="w-5 h-5 rounded-full border border-zinc-800" />
        )}
        <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[100px] uppercase">
          {user.displayName || user.email?.split('@')[0] || user.phoneNumber || 'Node Active'}
        </span>
        <button 
          onClick={handleSignOut}
          className="text-[9px] font-mono bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/40 px-2 py-0.5 rounded-sm transition uppercase"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => { setIsOpen(true); setError(null); }}
        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-theme-primary/30 text-[10px] font-mono text-zinc-400 hover:text-white rounded-sm tracking-widest uppercase transition-all shadow-sm"
      >
        <Key className="w-3.5 h-3.5" />
        Sign In
      </button>

      {/* reCAPTCHA hidden anchor */}
      <div id="recaptcha-container"></div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 max-w-sm w-full rounded-lg p-6 relative shadow-2xl">
            
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xs font-bold tracking-[0.2em] text-white uppercase mb-5 pb-2 border-b border-zinc-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-theme-primary" /> Access Credential Cipher
            </h3>

            {/* Tabs */}
            <div className="flex border-b border-zinc-900 text-[9px] font-mono mb-5">
              <button 
                onClick={() => { setTab('google'); setError(null); }}
                className={`flex-1 pb-2 border-b uppercase tracking-wider text-center ${tab === 'google' ? 'border-theme-primary text-theme-primary font-bold' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
              >
                Google
              </button>
              <button 
                onClick={() => { setTab('email'); setError(null); }}
                className={`flex-1 pb-2 border-b uppercase tracking-wider text-center ${tab === 'email' ? 'border-theme-primary text-theme-primary font-bold' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
              >
                Email
              </button>
              <button 
                onClick={() => { setTab('phone'); setError(null); }}
                className={`flex-1 pb-2 border-b uppercase tracking-wider text-center ${tab === 'phone' ? 'border-theme-primary text-theme-primary font-bold' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
              >
                Phone
              </button>
            </div>

            {/* Errors */}
            {error && (
              <div className="mb-4 p-2 bg-red-950/20 border border-red-900/40 rounded text-red-400 text-[9px] font-mono uppercase break-words">
                {error}
              </div>
            )}

            {/* Google Tab */}
            {tab === 'google' && (
              <div className="space-y-4 py-3">
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-theme-primary/30 text-[10px] font-mono text-zinc-300 hover:text-white rounded transition-all tracking-wider uppercase font-bold"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sync with Google
                </button>
              </div>
            )}

            {/* Email Tab */}
            {tab === 'email' && (
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-zinc-400 uppercase block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-zinc-900 border border-zinc-800 text-base sm:text-xs font-mono text-white placeholder-zinc-700 rounded p-2.5 outline-none focus:border-theme-primary/50 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-zinc-400 uppercase block">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900 border border-zinc-800 text-base sm:text-xs font-mono text-white placeholder-zinc-700 rounded p-2.5 outline-none focus:border-theme-primary/50 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-theme-primary hover:bg-emerald-500 text-black font-bold uppercase font-mono rounded text-[10px] tracking-wider transition-colors mt-2"
                >
                  {isRegistering ? 'Register Node' : 'Access Cipher'}
                </button>

                <div className="text-center mt-3">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-[9px] font-mono text-zinc-500 hover:text-zinc-300 uppercase underline"
                  >
                    {isRegistering ? 'Already registered? Sign In' : 'Need a node? Register'}
                  </button>
                </div>
              </form>
            )}

            {/* Phone Tab */}
            {tab === 'phone' && (
              <div className="space-y-4">
                {!confirmationResult ? (
                  <form onSubmit={handleSendCode} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono text-zinc-400 uppercase block">Phone Number</label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        placeholder="+15551234567"
                        className="w-full bg-zinc-900 border border-zinc-800 text-base sm:text-xs font-mono text-white placeholder-zinc-700 rounded p-2.5 outline-none focus:border-theme-primary/50 transition-colors"
                      />
                      <span className="text-[8px] font-mono text-zinc-600 block uppercase">Include country code (e.g. +1 for US)</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingCode}
                      className="w-full py-2.5 bg-theme-primary hover:bg-emerald-500 text-black font-bold uppercase font-mono rounded text-[10px] tracking-wider transition-colors disabled:opacity-40"
                    >
                      {isSendingCode ? 'Sending...' : 'Send Transmission Code'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono text-zinc-400 uppercase block">Verification Code (OTP)</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full bg-zinc-900 border border-zinc-800 text-base sm:text-xs font-mono text-white placeholder-zinc-700 rounded p-2.5 outline-none focus:border-theme-primary/50 transition-colors text-center tracking-[0.5em] font-bold"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifyingCode}
                      className="w-full py-2.5 bg-theme-primary hover:bg-emerald-500 text-black font-bold uppercase font-mono rounded text-[10px] tracking-wider transition-colors disabled:opacity-40"
                    >
                      {isVerifyingCode ? 'Verifying...' : 'Verify and Unlock'}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setConfirmationResult(null)}
                        className="text-[9px] font-mono text-zinc-500 hover:text-zinc-300 uppercase underline"
                      >
                        Change Phone Number
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
};
