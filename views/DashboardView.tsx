
import React from 'react';
import { motion } from 'framer-motion';
import { Camera, CheckSquare } from 'lucide-react';
import { DashboardProps } from '../types';
import DashboardStats from '../components/dashboard/DashboardStats';
import DashboardSchedule from '../components/dashboard/DashboardSchedule';
import DashboardActionItems from '../components/dashboard/DashboardActionItems';

const DashboardView: React.FC<DashboardProps> = ({ user, bookings, transactions = [], onSelectBooking, selectedDate, onNavigate, config, onOpenWhatsApp }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const todayBookings = bookings.filter(b => b.date === selectedDate && b.status !== 'CANCELLED');
  
  // REAL REVENUE CALCULATION (CASH COLLECTED)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const revenueThisMonth = transactions
    .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'INCOME' && 
               t.status === 'COMPLETED' &&
               tDate.getMonth() === currentMonth && 
               tDate.getFullYear() === currentYear;
    })
    .reduce((acc, t) => acc + t.amount, 0);
  
  // REAL OCCUPANCY CALCULATION
  const OPERATING_HOURS = 13; // 09:00 - 22:00
  const TOTAL_ROOMS = 3;
  const TOTAL_CAPACITY_HOURS = OPERATING_HOURS * TOTAL_ROOMS;
  
  const hoursBookedToday = todayBookings.reduce((acc, b) => acc + b.duration, 0);
  const utilizationRate = Math.round((hoursBookedToday / TOTAL_CAPACITY_HOURS) * 100);

  // Smart Action Items Logic
  const taxRate = config?.taxRate || 0;
  
  const unpaidBookings = bookings.filter(b => {
      if (b.status === 'CANCELLED') return false;
      const totalDue = b.price * (1 + taxRate/100);
      // Tolerance of 100 rupiah for float errors
      return (totalDue - b.paidAmount) > 100;
  });

  const pendingEdits = bookings.filter(b => ['CULLING', 'EDITING'].includes(b.status));
  const approvalNeeded = bookings.filter(b => b.status === 'REVIEW');
  
  const actionItems = [
      ...unpaidBookings.map(b => ({
          id: b.id,
          title: 'Payment Outstanding',
          subtitle: `Order #${b.id.substring(0,4)} - ${b.clientName}`,
          type: 'urgent',
          booking: b,
          onClick: () => onSelectBooking(b.id)
      })),
      ...approvalNeeded.map(b => ({
          id: b.id,
          title: 'Review Needed',
          subtitle: `${b.clientName} waiting for approval`,
          type: 'normal',
          booking: b,
          onClick: () => onSelectBooking(b.id)
      })),
       ...pendingEdits.slice(0, 2).map(b => ({
          id: b.id,
          title: 'Production Queue',
          subtitle: `${b.clientName} is in ${b.status.toLowerCase()}`,
          type: 'normal',
          booking: b,
          onClick: () => onSelectBooking(b.id)
      }))
  ].slice(0, 5); 

  const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // --- ON-SET MODE LOGIC (For Photographers) ---
  const activeShoot = todayBookings.find(b => 
      b.status === 'SHOOTING' && b.photographerId === user.id
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 lg:space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-lumina-text mb-1 lg:mb-2">
            Good Afternoon, <span className="text-lumina-accent">{(user.name || '').split(' ')[0]}</span>
          </h1>
          <p className="text-lumina-muted text-sm lg:text-base">Schedule for <span className="text-lumina-text font-bold">{formattedDate}</span></p>
        </div>
        <div className="px-4 py-2 bg-lumina-highlight/50 rounded-full border border-lumina-highlight flex items-center self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-lumina-accent animate-pulse mr-2"></span>
          <span className="text-xs lg:text-sm font-mono text-lumina-accent">SYSTEM ONLINE</span>
        </div>
      </div>

      {/* ON-SET MODE CARD (Photographers Only) */}
      {activeShoot && (
          <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-4 right-4 flex gap-2">
                  <span className="bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full animate-pulse">LIVE SESSION</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">On-Set Mode</h2>
              <p className="text-blue-200 text-sm mb-4">You are currently shooting for <span className="font-bold text-white">{activeShoot.clientName}</span>.</p>
              
              <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
                  <button onClick={() => onSelectBooking(activeShoot.id)} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm">
                      <Camera size={18}/> View Session Details
                  </button>
                  <button onClick={() => onNavigate('inventory')} className="bg-lumina-surface border border-lumina-highlight text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-lumina-highlight transition-colors text-sm">
                      <CheckSquare size={18}/> Check Assets
                  </button>
              </div>
          </motion.div>
      )}

      {/* Stats Grid */}
      <DashboardStats 
          todayBookingsCount={todayBookings.length}
          revenueThisMonth={revenueThisMonth}
          pendingEditsCount={pendingEdits.length}
          utilizationRate={utilizationRate}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule List */}
        <DashboardSchedule 
            bookings={todayBookings}
            selectedDate={selectedDate}
            onSelectBooking={onSelectBooking}
            onNavigate={onNavigate}
            itemVariants={itemVariants}
        />

        {/* Quick Actions */}
        <DashboardActionItems 
            actionItems={actionItems}
            onOpenWhatsApp={onOpenWhatsApp}
            itemVariants={itemVariants}
        />
      </div>
    </motion.div>
  );
};

export default DashboardView;
