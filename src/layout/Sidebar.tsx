import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
 import {
  LayoutDashboard,
  Users,
  Settings,
  Wallet,
  Users2,
  CreditCard,
  MessageSquare,
  LogOut,
  LifeBuoy,
  ListPlus
} from 'lucide-react';
import fabLeadLogo from '/public/assets/fablead_logo.svg';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';
import { useAppDispatch } from '@/src/store/hooks';
import { logout } from '@/src/store/slices/authSlice';
import { showSuccess, showError } from '@/src/lib/toast';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Users2, label: 'Groups', path: '/admin/groups' },
  // { icon: Wallet, label: 'Monetization', path: '/admin/monetization' },
  { icon: MessageSquare, label: 'Inquiries', path: '/admin/enquiry' },
  { icon: LifeBuoy, label: 'Support Ticket', path: '/admin/support' },
  { icon: CreditCard, label: 'Subscription', path: '/admin/subscription' },
  { icon: ListPlus, label: 'Features', path: '/admin/features' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export function Sidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      showSuccess('Logged out successfully');
      navigate('/admin/login');
      onClose?.();
    } catch (error: any) {
      // Even if API fails, we still logout locally (handled in authSlice)
      showSuccess('Logged out successfully');
      navigate('/admin/login');
      onClose?.();
    }
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen w-72 z-50 ${mobile ? 'block' : 'hidden lg:block'}`}>
      <div className="m-4 h-[calc(100vh-2rem)] bg-navy rounded-[12px] shadow-2xl flex flex-col relative overflow-hidden">
        {/* Abstract Background Glow */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="p-6 flex items-center justify-center relative z-10">
          <NavLink to="/admin/dashboard" className="bg-white rounded-xl px-4 py-2 hover:shadow-xl transition-shadow">
            <img
              src={fabLeadLogo}
              alt="FabStudio Logo"
              className="h-20 w-auto object-contain"
            />
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 relative z-10 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose?.()}
              className={({ isActive }) => cn(
                "group relative flex items-center gap-3 px-4 py-3.5 rounded-[12px] transition-all duration-300",
                isActive
                  ? "bg-white/10 text-white shadow-inner"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                    isActive ? "text-primary stroke-[2.5]" : "text-inherit"
                  )} />
                  <span className="font-medium text-sm tracking-wide">{item.label}</span>

                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_12px_rgba(255,102,0,0.8)]"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 relative z-10">
         
          <button
            onClick={handleLogout}
            className="w-full bg-white/5 hover:bg-white/10 text-white rounded-[12px] p-4 flex items-center justify-center gap-3 transition-colors group"
          >
            <LogOut className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
            <span className="font-medium text-sm tracking-wide">Logout</span>
          </button>
         </div>
      </div>
    </aside>
  );
}
