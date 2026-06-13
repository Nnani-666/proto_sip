import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'signin' }) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status State
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { signIn, signUp, forgotPassword } = useAuth();

  const handleClose = () => {
    setFormError(null);
    setSuccessMessage(null);
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    onClose();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password, rememberMe);
      handleClose();
    } catch (err: any) {
      setFormError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!name || !email || !password || !confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await signUp(name, email, password);
      handleClose();
    } catch (err: any) {
      setFormError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    if (!email) {
      setFormError('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const msg = await forgotPassword(email);
      setSuccessMessage(msg || 'Password reset link sent to your email.');
    } catch (err: any) {
      setFormError(err.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="glass-panel w-full max-w-md relative z-10 p-8 rounded-2xl flex flex-col gap-6"
      >
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X size={18} />
        </button>

        {/* Tab Headers */}
        {tab !== 'forgot' && (
          <div className="flex border-b border-[var(--card-border)] pb-2 gap-4">
            <button 
              onClick={() => { setTab('signin'); setFormError(null); }}
              className={`text-xl font-bold pb-2 transition-all border-b-2 relative ${
                tab === 'signin' 
                  ? 'text-[var(--text-primary)] border-[var(--accent-primary)]' 
                  : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'
              }`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setTab('signup'); setFormError(null); }}
              className={`text-xl font-bold pb-2 transition-all border-b-2 relative ${
                tab === 'signup' 
                  ? 'text-[var(--text-primary)] border-[var(--accent-primary)]' 
                  : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {tab === 'forgot' && (
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Reset Password</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Enter your registered email to receive a recovery link.</p>
          </div>
        )}

        {/* Errors / Success Alerts */}
        {formError && (
          <div className="flex items-center gap-2.5 p-3.5 bg-red-950/35 border border-red-900/50 rounded-xl text-xs text-red-200">
            <ShieldAlert size={16} className="text-red-400 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2.5 p-3.5 bg-emerald-950/35 border border-emerald-900/50 rounded-xl text-xs text-emerald-200">
            <span className="shrink-0 text-emerald-400 font-bold">✓</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Forms container */}
        <AnimatePresence mode="wait">
          {tab === 'signin' && (
            <motion.form 
              key="signin"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleSignIn}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 bg-transparent border border-[var(--card-border)] focus:border-[var(--text-primary)] outline-none py-2.5 px-3 rounded text-xs transition-colors text-[var(--text-primary)]"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 bg-transparent border border-[var(--card-border)] focus:border-[var(--text-primary)] outline-none py-2.5 px-3 rounded text-xs transition-colors text-[var(--text-primary)]"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs mt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[var(--card-border)] bg-transparent text-[var(--text-primary)] focus:ring-[var(--text-primary)]"
                  />
                  Remember Me
                </label>
                <button 
                  type="button"
                  onClick={() => { setTab('forgot'); setFormError(null); }}
                  className="text-[var(--text-primary)] hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3 rounded text-xs transition-all cursor-pointer uppercase tracking-wider hover:opacity-90 mt-3"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </motion.form>
          )}

          {tab === 'signup' && (
            <motion.form 
              key="signup"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleSignUp}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="w-full pl-11 bg-transparent border border-[var(--card-border)] focus:border-[var(--text-primary)] outline-none py-2.5 px-3 rounded text-xs transition-colors text-[var(--text-primary)]"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 bg-transparent border border-[var(--card-border)] focus:border-[var(--text-primary)] outline-none py-2.5 px-3 rounded text-xs transition-colors text-[var(--text-primary)]"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 bg-transparent border border-[var(--card-border)] focus:border-[var(--text-primary)] outline-none py-2.5 px-3 rounded text-xs transition-colors text-[var(--text-primary)]"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 bg-transparent border border-[var(--card-border)] focus:border-[var(--text-primary)] outline-none py-2.5 px-3 rounded text-xs transition-colors text-[var(--text-primary)]"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3 rounded text-xs transition-all cursor-pointer uppercase tracking-wider hover:opacity-90 mt-3"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </motion.form>
          )}

          {tab === 'forgot' && (
            <motion.form 
              key="forgot"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleForgotPassword}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Registered Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 bg-transparent border border-[var(--card-border)] focus:border-[var(--text-primary)] outline-none py-2.5 px-3 rounded text-xs transition-colors text-[var(--text-primary)]"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs mt-1">
                <button 
                  type="button"
                  onClick={() => { setTab('signin'); setFormError(null); setSuccessMessage(null); }}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline"
                >
                  ← Back to Sign In
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3 rounded text-xs transition-all cursor-pointer uppercase tracking-wider hover:opacity-90 mt-3"
              >
                {loading ? 'Sending Request...' : 'Send Recovery Link'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AuthModal;
