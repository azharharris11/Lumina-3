
import React from 'react';
import { LayoutDashboard, CalendarDays, Box, Users, Menu, X, Wallet, Layers, Settings, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarProps } from '../types';

interface MobileNavProps extends SidebarProps {
  // Inherits props like onNavigate, currentView, etc.
}

const MobileNav: React.FC<MobileNavProps> = ({ onNavigate, currentView, bookings, currentUser, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // UPDATED: High priority items for on-set photographers/managers
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'calendar', label: 'Schedule', icon: CalendarDays },
    { id: 'clients', label: 'Clients', icon: Users }, // Moved out of More
    { id: 'inventory', label: 'Gear', icon: Box },    // Moved out of More, renamed for brevity
  ];

  // Secondary items in More menu
  const menuItems = [
    { id: 'production', label: 'Production Board', icon: Layers },
    { id: 'finance', label: 'Finance & Invoices', icon: Wallet },
    { id: 'team', label: 'Team Management', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNav = (view: string) => {
    onNavigate(view);
    setIsMenuOpen(false);
  }

  return (
    <>
      {/* Bottom Bar - Solid Background for Readability */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-lumina-surface border-t border-lumina-highlight z-[40] pb-safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between items-center h-16 px-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 active:scale-95 transition-transform ${isActive ? 'text-lumina-accent' : 'text-lumina-muted'}`}
                role="button"
                tabIndex={0}
                aria-label={item.label}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
                {isActive && <motion.div layoutId="mobileNavIndicator" className="absolute bottom-0 w-8 h-1 bg-lumina-accent rounded-t-full" />}
              </button>
            )
          })}
          
          <button
            onClick={() => setIsMenuOpen(true)}
            className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 ${isMenuOpen ? 'text-lumina-text' : 'text-lumina-muted'}`}
            role="button"
            aria-label="More Menu"
          >
            <Menu size={22} />
            <span className="text-[10px] font-bold tracking-wide">More</span>
          </button>
        </div>
      </div>

      {/* Full Screen More Menu - Solid Background */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-0 z-[50] bg-lumina-base flex flex-col"
          >
            <div className="p-4 flex justify-between items-center border-b border-lumina-highlight bg-lumina-surface">
              <h2 className="text-xl font-bold text-white font-display">Menu</h2>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-lumina-base border border-lumina-highlight rounded-full text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
               <div className="flex items-center gap-4 p-4 bg-lumina-surface rounded-xl border border-lumina-highlight mb-6">
                  <img src={currentUser.avatar} className="w-14 h-14 rounded-full border-2 border-lumina-highlight" />
                  <div>
                    <p className="font-bold text-lg text-white">{currentUser.name}</p>
                    <p className="text-xs text-lumina-accent font-bold uppercase tracking-wider bg-lumina-accent/10 px-2 py-0.5 rounded w-fit mt-1">{currentUser.role}</p>
                  </div>
               </div>

               <h3 className="text-xs font-bold text-lumina-muted uppercase tracking-wider mb-2 px-2 mt-6">Management</h3>
               <div className="grid grid-cols-2 gap-3">
                   {menuItems.map(item => (
                     <button
                        key={item.id}
                        onClick={() => handleNav(item.id)}
                        className="flex flex-col items-center justify-center p-4 bg-lumina-surface border border-lumina-highlight rounded-xl text-white font-bold active:scale-95 transition-all hover:border-lumina-accent"
                     >
                       <item.icon size={24} className="mb-2 text-lumina-muted" />
                       <span className="text-sm">{item.label}</span>
                     </button>
                   ))}
               </div>

               <button onClick={onLogout} className="w-full text-center p-4 text-rose-500 font-bold mt-8 border border-rose-500/20 rounded-xl bg-rose-500/5">
                 Log Out
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNav;
