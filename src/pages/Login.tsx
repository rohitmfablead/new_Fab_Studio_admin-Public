import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';
import logos from "../../public/assets/fablead_logo.svg"

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Rate limiting state
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);

  // Initialize rate limit state from localStorage
  useEffect(() => {
    const email = formData.email?.toLowerCase().trim();
    if (!email) {
      setLockoutTime(null);
      setFailedAttempts(0);
      return;
    }

    const storedLockout = localStorage.getItem(`admin_login_lockout_${email}`);
    const storedAttempts = localStorage.getItem(`admin_login_attempts_${email}`);
    
    setFailedAttempts(parseInt(storedAttempts || '0', 10));

    if (storedLockout) {
      const lockoutTimestamp = parseInt(storedLockout, 10);
      if (Date.now() < lockoutTimestamp) {
        setLockoutTime(lockoutTimestamp);
      } else {
        localStorage.removeItem(`admin_login_lockout_${email}`);
        localStorage.removeItem(`admin_login_attempts_${email}`);
        setLockoutTime(null);
        setFailedAttempts(0);
      }
    } else {
      setLockoutTime(null);
    }
  }, [formData.email]);

  // Update remaining time timer
  useEffect(() => {
    if (!lockoutTime) return;

    const email = formData.email?.toLowerCase().trim();
    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= lockoutTime) {
        setLockoutTime(null);
        setRemainingTime(0);
        if (email) {
          localStorage.removeItem(`admin_login_lockout_${email}`);
          localStorage.removeItem(`admin_login_attempts_${email}`);
        }
        clearInterval(interval);
      } else {
        setRemainingTime(Math.ceil((lockoutTime - now) / 1000));
      }
    }, 1000);

    // Immediate first tick update
    const initialRemaining = Math.ceil((lockoutTime - Date.now()) / 1000);
    if (initialRemaining > 0) {
      setRemainingTime(initialRemaining);
    } else {
      setLockoutTime(null);
    }

    return () => clearInterval(interval);
  }, [lockoutTime, formData.email]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component unmounts or form changes
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (formData.email || formData.password) {
      setFormErrors({});
      dispatch(clearError());
    }
  }, [formData, dispatch]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (lockoutTime) {
      return; // Prevent submission if locked out
    }

    console.log('Form data being submitted:', formData);

    try {
      const result = await dispatch(login(formData));
      console.log('Login result:', result);

      if (login.fulfilled.match(result)) {
        console.log('Login successful, navigating to dashboard');

        // Check if token is stored
        const storedToken = localStorage.getItem('auth_token');
        console.log('Token in localStorage after login:', storedToken ? 'YES' : 'NO');

        // Store remember me preference
        if (rememberMe) {
          localStorage.setItem('remember_email', formData.email);
        } else {
          localStorage.removeItem('remember_email');
        }
        
        // Reset rate limiting
        const email = formData.email?.toLowerCase().trim();
        if (email) {
          localStorage.removeItem(`admin_login_attempts_${email}`);
          localStorage.removeItem(`admin_login_lockout_${email}`);
        }
        
        navigate('/admin/dashboard');
      } else {
        console.log('Login failed:', result);
        handleFailedAttempt();
      }
    } catch (err) {
      console.log('Login submission error:', err);
      handleFailedAttempt();
    }
  };

  const handleFailedAttempt = () => {
    const email = formData.email?.toLowerCase().trim();
    if (!email) return;

    const currentAttempts = parseInt(localStorage.getItem(`admin_login_attempts_${email}`) || '0', 10);
    const newAttempts = currentAttempts + 1;
    localStorage.setItem(`admin_login_attempts_${email}`, newAttempts.toString());
    setFailedAttempts(newAttempts);

    if (newAttempts >= 5) {
      const lockoutEnd = Date.now() + 5 * 60 * 1000; // 5 minutes
      localStorage.setItem(`admin_login_lockout_${email}`, lockoutEnd.toString());
      setLockoutTime(lockoutEnd);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remember_email');
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail
      }));
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-6 relative overflow-y-auto">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-secondary/10 blur-[100px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/5 backdrop-blur-2xl rounded-[32px] p-10 border border-white/10 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/40 mb-2">
            <img src={logos} alt="FabStudio" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* General Error Display */}
        {lockoutTime ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-500 font-medium">
              Too many failed login attempts. Please try again in {Math.floor(remainingTime / 60)}m {remainingTime % 60}s.
            </p>
          </motion.div>
        ) : (error || formErrors.general) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-500 font-medium">
              {error || formErrors.general}
              {failedAttempts > 0 && failedAttempts < 5 && ` (${5 - failedAttempts} attempt${5 - failedAttempts === 1 ? '' : 's'} remaining)`}
            </p>
          </motion.div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Work Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-2xl text-white outline-none transition-all font-medium ${formErrors.email
                    ? 'border-red-500/40 focus:border-red-500/60 focus:ring-4 focus:ring-red-500/10'
                    : 'border-white/10 focus:border-primary/40 focus:ring-4 focus:ring-primary/5'
                  }`}
                placeholder="Enter email"
                disabled={isLoading}
              />
            </div>
            {formErrors.email && (
              <p className="text-red-400 text-xs font-medium mt-1 ml-1">{formErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pl-12 pr-12 py-4 bg-white/5 border rounded-2xl text-white outline-none transition-all font-medium ${formErrors.password
                    ? 'border-red-500/40 focus:border-red-500/60 focus:ring-4 focus:ring-red-500/10'
                    : 'border-white/10 focus:border-primary/40 focus:ring-4 focus:ring-primary/5'
                  }`}
                placeholder="Enter password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formErrors.password && (
              <p className="text-red-400 text-xs font-medium mt-1 ml-1">{formErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !!lockoutTime}
            className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
            <span className="relative flex items-center justify-center gap-2">
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : lockoutTime ? (
                <span>Locked Out</span>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
