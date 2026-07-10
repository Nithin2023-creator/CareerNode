import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../lib/api';

export default function AuthForm({ onSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const navigateAfterAuth = (user) => {
    onSuccess?.();
    const redirect = searchParams.get('redirect');
    if (redirect && redirect.startsWith('/')) {
      navigate(redirect);
      return;
    }
    navigate(user?.isAdmin ? '/admin' : '/dashboard');
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.google(tokenResponse.access_token);
      localStorage.setItem('cn_token', data.token);
      localStorage.setItem('cn_user', JSON.stringify(data.user));
      
      if (data.isNewUser) {
        sessionStorage.setItem('cn_is_new_user', '1');
        if (data.welcomeCredits) {
          sessionStorage.setItem('cn_welcome_credits', data.welcomeCredits.toString());
        }
      }
      
      navigateAfterAuth(data.user);
    } catch (err) {
      setError(err.message || 'Google login was unsuccessful.');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Google login was unsuccessful. Please try again.'),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic Validation
    if (mode === 'signup') {
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        setIsLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }
    }

    try {
      let data;
      if (mode === 'signup') {
        data = await authApi.signup({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
      } else {
        data = await authApi.login({
          email: formData.email,
          password: formData.password
        });
      }

      localStorage.setItem('cn_token', data.token);
      localStorage.setItem('cn_user', JSON.stringify(data.user));
      
      if (data.isNewUser) {
        sessionStorage.setItem('cn_is_new_user', '1');
        if (data.welcomeCredits) {
          sessionStorage.setItem('cn_welcome_credits', data.welcomeCredits.toString());
        }
      }
      
      navigateAfterAuth(data.user);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Mode Toggle */}
      <div className="flex bg-black/5 p-1 rounded-full mb-8 relative">
        <div 
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-black rounded-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-sm"
          style={{ transform: mode === 'signup' ? 'translateX(100%)' : 'translateX(0)' }}
        />
        <button
          type="button"
          onClick={() => { setMode('login'); setError(null); }}
          className={`flex-1 py-2 text-sm font-bold tracking-wide transition-colors relative z-10 ${mode === 'login' ? 'text-white' : 'text-black/60 hover:text-black'}`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => { setMode('signup'); setError(null); }}
          className={`flex-1 py-2 text-sm font-bold tracking-wide transition-colors relative z-10 ${mode === 'signup' ? 'text-white' : 'text-black/60 hover:text-black'}`}
        >
          Create account
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      {mode === 'signup' && (
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-black bg-[var(--color-accent-yellow)] px-4 py-2 rounded-full inline-block shadow-[var(--shadow-soft)]">
            Get 50 free credits — no card needed
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === 'signup' && (
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              required={mode === 'signup'}
              value={formData.name}
              onChange={handleInputChange}
              className="w-full bg-black/5 border border-black/10 rounded-[16px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)] transition-all font-medium"
            />
          </div>
        )}

        <div>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="w-full bg-black/5 border border-black/10 rounded-[16px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)] transition-all font-medium"
          />
        </div>

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password (min 8 chars)"
            required
            value={formData.password}
            onChange={handleInputChange}
            className="w-full bg-black/5 border border-black/10 rounded-[16px] pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)] transition-all font-medium"
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {mode === 'signup' && (
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              required={mode === 'signup'}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full bg-black/5 border border-black/10 rounded-[16px] pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)] transition-all font-medium"
            />
          </div>
        )}

        {mode === 'login' && (
          <div className="flex justify-end mt-1">
            <span 
              className="text-xs font-bold text-black/40 cursor-not-allowed group relative"
              title="Coming soon"
            >
              Forgot password?
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full pill-btn mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-black/5" />
        <span className="text-xs font-bold text-black/30 uppercase tracking-widest">or</span>
        <div className="flex-1 h-px bg-black/5" />
      </div>

      <button
        type="button"
        onClick={() => loginWithGoogle()}
        disabled={isLoading}
        className="w-full bento-button bg-white text-black border border-black/10 shadow-sm hover:bg-black/5 flex items-center justify-center gap-3 relative disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <div className="mt-8 text-xs text-black/40 font-medium leading-relaxed max-w-xs mx-auto text-center">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </div>
    </div>
  );
}
