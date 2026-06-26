import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, ChevronRight, User, LogOut, ChevronDown, Sparkles, KeyRound, Eye, EyeOff, X } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { logout } from '@/src/store/slices/authSlice';
import { showSuccess, showError } from '@/src/lib/toast';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector((state) => state.settings);
  const pathnames = location.pathname.split('/').filter((x) => x);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChangePwOpen, setIsChangePwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [pwShow, setPwShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      showSuccess('Logged out successfully');
      navigate('/admin/login');
    } catch (error: any) {
      // Even if API fails, we still logout locally (handled in authSlice)
      showSuccess('Logged out successfully');
      navigate('/admin/login');
    }
  };

  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    // Validation
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError('New passwords do not match');
      return;
    }

    if (pwForm.new_password.length < 6) {
      setPwError('Password must be at least 6 characters');
      return;
    }

    try {
      setPwLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.fabphotopic.com'}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: pwForm.current_password,
          new_password: pwForm.new_password,
          confirm_password: pwForm.confirm_password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPwSuccess('Password changed successfully!');
        showSuccess('Password changed successfully!');
        setTimeout(() => {
          setIsChangePwOpen(false);
          setPwForm({ current_password: '', new_password: '', confirm_password: '' });
          setPwSuccess('');
        }, 1500);
      } else {
        setPwError(result.message || 'Failed to change password');
        showError(result.message || 'Failed to change password');
      }
    } catch (error: any) {
      setPwError(error?.message || 'Failed to change password');
      showError(error?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get profile data from settings
  const firstName = settings?.profile?.first_name || 'Admin';
  const lastName = settings?.profile?.last_name || 'User';
  const fullName = `${firstName} ${lastName}`;
  const email = settings?.profile?.email || 'admin@fabphotopic.com';
  const title = settings?.profile?.professional_title || 'SUPER ADMIN';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <>
    <header className="glass-header px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-500" />
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center gap-2 text-sm">
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;

            return (
              <React.Fragment key={name}>
                {index > 0 && <ChevronRight className="w-4 h-4 text-gray-300" />}
                {isLast ? (
                  <span className="font-semibold text-gray-900 capitalize px-1">{name}</span>
                ) : (
                  <Link 
                    to={routeTo} 
                    className="text-gray-400 hover:text-primary transition-colors capitalize px-1"
                  >
                    {name}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Quick search..."
            className="pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-[12px] text-sm focus:outline-none focus:bg-white focus:border-primary/20 w-64 transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/notifications')}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors group"
          >
            <Bell className="w-5 h-5 text-gray-500 group-hover:text-primary" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white" />
          </button>
          
          <div className="h-8 w-[1px] bg-gray-200" />
          
          {/* Unique Profile Section */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={cn(
                "flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border transition-all duration-300",
                isProfileOpen ? "bg-white border-primary/20 shadow-lg" : "bg-gray-50 border-transparent hover:bg-white hover:border-gray-200"
              )}
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white shadow-sm">
                  {initials}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full border-2 border-white" />
              </div>
              <div className="hidden sm:block text-left px-1">
                <p className="text-[11px] font-black text-navy leading-none uppercase tracking-wider">{fullName}</p>
                <p className="text-[9px] text-gray-400 font-bold leading-none mt-1">{title}</p>
              </div>
              <ChevronDown className={cn("w-3.5 h-3.5 text-gray-400 transition-transform duration-300", isProfileOpen && "rotate-180 text-primary")} />
            </button>

            {/* Unique Dropdown Menu */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                  className="absolute right-0 mt-3 w-80 bg-white backdrop-blur-2xl rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/50 overflow-hidden z-50 origin-top-right"
                >
                  {/* Dropdown Header */}
                  <div className="p-6 bg-gradient-to-br from-navy to-[#1a1c2c] relative overflow-hidden">
                    <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-primary/20 blur-[40px] rounded-full" />
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center p-0.5">
                        <div className="w-full h-full rounded-xl bg-primary flex items-center justify-center text-white text-xl font-black">
                          {initials}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-bold tracking-tight">{fullName}</h4>
                          <span className="p-1 rounded bg-primary/20 text-primary">
                            <Sparkles className="w-2.5 h-2.5" />
                          </span>
                        </div>
                        <p className="text-white/40 text-xs font-medium">{email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Body */}
                  <div className="p-3">
                    <div className="space-y-1">
                      {[
                        { icon: User, label: 'My Identity', desc: 'Manage your profile details', path: '/admin/settings' },
                      ].map((item, i) => (
                        <button
                          key={i}
                          onClick={() => { setIsProfileOpen(false); navigate(item.path); }}
                          className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-primary/5 text-gray-400 group-hover:text-primary flex items-center justify-center transition-colors">
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div className="text-left cursor-pointer">
                            <p className="text-sm font-bold text-navy">{item.label}</p>
                            <p className="text-[10px] text-gray-400 font-medium leading-none mt-1">{item.desc}</p>
                          </div>
                        </button>
                      ))}

                      {/* Change Password */}
                      <button
                        onClick={() => { setIsProfileOpen(false); setIsChangePwOpen(true); }}
                        className="w-full flex cursor-pointer items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-primary/5 text-gray-400 group-hover:text-primary flex items-center justify-center transition-colors">
                          <KeyRound className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-navy">Change Password</p>
                          <p className="text-[10px] text-gray-400 font-medium leading-none mt-1">Update your account password</p>
                        </div>
                      </button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 px-3 pb-3 ">
                      <button 
                        onClick={handleLogout}
                        className="w-full py-4 rounded-xl flex items-center cursor-pointer justify-center gap-2 bg-danger/5 hover:bg-danger text-danger hover:text-white font-black text-xs uppercase tracking-[0.2em] transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>

      {/* Change Password Modal */}
      <AnimatePresence>
        {isChangePwOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={(e) => { if (e.target === e.currentTarget) setIsChangePwOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white rounded-[24px] shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-br from-navy to-[#1a1c2c] relative overflow-hidden flex items-center justify-between">
                <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-primary/20 blur-[40px] rounded-full" />
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base">Change Password</h3>
                    <p className="text-white/40 text-xs">Update your account password</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsChangePwOpen(false)}
                  className="relative z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleChangePw} className="p-6 space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">Current Password</label>
                  <div className="relative">
                    <input
                      type={pwShow.current ? 'text' : 'password'}
                      value={pwForm.current_password}
                      onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
                      required
                      placeholder="Enter current password"
                      className="w-full px-4 py-3 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary/40 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setPwShow({ ...pwShow, current: !pwShow.current })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                    >
                      {pwShow.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={pwShow.new ? 'text' : 'password'}
                      value={pwForm.new_password}
                      onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                      required
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary/40 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setPwShow({ ...pwShow, new: !pwShow.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                    >
                      {pwShow.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={pwShow.confirm ? 'text' : 'password'}
                      value={pwForm.confirm_password}
                      onChange={(e) => setPwForm({ ...pwForm, confirm_password: e.target.value })}
                      required
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary/40 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setPwShow({ ...pwShow, confirm: !pwShow.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                    >
                      {pwShow.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error / Success */}
                {pwError && (
                  <p className="text-xs text-red-500 font-medium bg-red-50 px-3 py-2 rounded-lg">{pwError}</p>
                )}
                {pwSuccess && (
                  <p className="text-xs text-green-600 font-medium bg-green-50 px-3 py-2 rounded-lg">{pwSuccess}</p>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsChangePwOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={pwLoading}
                    className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {pwLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
