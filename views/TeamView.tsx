
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Role, TeamViewProps, PackageCostItem } from '../types';
import { Plus, X } from 'lucide-react';
import TeamMemberCard from '../components/team/TeamMemberCard';
import TeamMemberModal from '../components/team/TeamMemberModal';
import TeamAvailabilityModal from '../components/team/TeamAvailabilityModal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useStudio } from '../contexts/StudioContext'; // Use hook directly for cleaner prop drilling if preferred, but prop is cleaner for structure

const TeamView: React.FC<TeamViewProps> = ({ users, bookings, onAddUser, onUpdateUser, onDeleteUser, onRecordExpense }) => {
  const { transactions } = useStudio(); // Access transactions here
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewScheduleUser, setViewScheduleUser] = useState<User | null>(null);
  const [userFormInitial, setUserFormInitial] = useState<Partial<User>>({});
  
  // Availability Modal
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [selectedStaffForAvailability, setSelectedStaffForAvailability] = useState<User | null>(null);

  // Confirmation State
  const [confirmState, setConfirmState] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void, isDanger?: boolean }>({
      isOpen: false, title: '', message: '', onConfirm: () => {}, isDanger: false
  });

  const closeConfirm = () => setConfirmState(prev => ({ ...prev, isOpen: false }));

  const getUserSchedule = (userId: string) => {
      return bookings.filter(b => (b.photographerId === userId || b.editorId === userId) && b.status !== 'COMPLETED' && b.status !== 'CANCELLED');
  }

  // NOTE: These helper functions calculate RAW earned data.
  // The actual "Paid vs Owed" logic is moved to TeamMemberCard for better encapsulation with transactions
  const getRevenueGenerated = (user: User) => {
      const completedBookings = bookings.filter(b => 
          (b.photographerId === user.id || b.editorId === user.id) && 
          b.status === 'COMPLETED'
      );
      
      return completedBookings.reduce((acc, b) => {
          const gross = b.price;
          let discountAmount = 0;
          if (b.discount) {
              discountAmount = b.discount.type === 'PERCENT' ? gross * (b.discount.value / 100) : b.discount.value;
          }
          const cogs = (b.costSnapshot || []).reduce((sum: number, cost: PackageCostItem) => sum + cost.amount, 0);
          const itemCosts = (b.items || []).reduce((sum: number, item) => sum + (item.cost || 0), 0);
          const netSales = Math.max(0, gross - discountAmount - cogs - itemCosts);
          return acc + netSales;
      }, 0);
  };
  
  const getEstimatedCommission = (user: User) => {
      if (!user.commissionRate || user.commissionRate <= 0) return 0;
      const netRevenue = getRevenueGenerated(user);
      return netRevenue * (user.commissionRate / 100);
  };

  const handlePayout = (user: User, amount: number) => {
      if (amount <= 0) {
          setConfirmState({
              isOpen: true,
              title: "No Outstanding Commission",
              message: `${user.name} has no commission pending payout.`,
              onConfirm: closeConfirm,
              isDanger: false
          });
          return;
      }
      
      setConfirmState({
          isOpen: true,
          title: "Confirm Payout",
          message: `Process payout of Rp ${amount.toLocaleString()} for ${user.name}? This will record an expense and deduct from their outstanding balance.`,
          onConfirm: () => {
              if (onRecordExpense) {
                  onRecordExpense({
                      description: `Commission Payout - ${user.name}`,
                      amount: amount,
                      category: 'Staff Salaries',
                      accountId: 'acc1', // Default, should ideally ask user
                      submittedBy: 'admin',
                      recipientId: user.id // CRITICAL: Link expense to user
                  });
              }
              closeConfirm();
          },
          isDanger: false
      });
  };

  const openAddModal = () => {
      setEditMode(false);
      setUserFormInitial({ name: '', email: '', phone: '', role: 'PHOTOGRAPHER', status: 'ACTIVE', specialization: '' });
      setIsModalOpen(true);
  }

  const openEditModal = (user: User) => {
      setEditMode(true);
      setUserFormInitial(user);
      setIsModalOpen(true);
  }

  const handleSaveUser = (userForm: Partial<User>) => {
      if (editMode && onUpdateUser && userForm.id) {
          onUpdateUser(userForm as User);
      } else if (onAddUser && userForm.name) {
          onAddUser({
              id: `u-${Date.now()}`,
              name: userForm.name,
              role: userForm.role as Role,
              email: userForm.email || 'user@lumina.id',
              phone: userForm.phone || '08...',
              avatar: `https://ui-avatars.com/api/?name=${userForm.name}&background=random`,
              status: 'ACTIVE',
              specialization: userForm.specialization,
              commissionRate: userForm.commissionRate || 10,
              joinedDate: new Date().toISOString().split('T')[0],
              unavailableDates: []
          });
      }
      setIsModalOpen(false);
  };

  const handleDelete = (user: User) => {
      const hasActiveBookings = bookings.some(b => 
          (b.photographerId === user.id || b.editorId === user.id) && 
          b.status !== 'COMPLETED' && 
          b.status !== 'CANCELLED'
      );

      if (hasActiveBookings) {
          setConfirmState({
              isOpen: true,
              title: "Cannot Delete Staff",
              message: `User '${user.name}' has active bookings assigned. Please reassign their bookings or mark them as Completed/Cancelled first.`,
              onConfirm: closeConfirm,
              isDanger: true
          });
          return;
      }

      setConfirmState({
          isOpen: true,
          title: "Delete Staff Member?",
          message: `Are you sure you want to permanently remove ${user.name}? This action cannot be undone.`,
          isDanger: true,
          onConfirm: () => {
              if (onDeleteUser) onDeleteUser(user.id);
              closeConfirm();
          }
      });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Team Management</h1>
          <p className="text-lumina-muted">Manage staff profiles, commissions, and schedules.</p>
        </div>
        <div className="flex gap-4">
            <div className="px-4 py-2 bg-lumina-surface border border-lumina-highlight rounded-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-sm font-bold text-white">{users.filter(u => u.status === 'ACTIVE').length} Active</span>
            </div>
            <button onClick={openAddModal} className="bg-lumina-accent text-lumina-base px-4 py-2 rounded-lg font-bold hover:bg-lumina-accent/90 transition-colors flex items-center gap-2">
                <Plus size={18} /> Add Staff
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {users.map((user, index) => (
            <TeamMemberCard 
                key={user.id}
                user={user}
                index={index}
                bookings={bookings}
                transactions={transactions}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onViewSchedule={setViewScheduleUser}
                onManageAvailability={(u) => { setSelectedStaffForAvailability(u); setIsAvailabilityModalOpen(true); }}
                onPayout={handlePayout}
                getRevenueGenerated={getRevenueGenerated}
                getEstimatedCommission={getEstimatedCommission}
            />
        ))}
      </div>

      <ConfirmationModal 
          isOpen={confirmState.isOpen}
          title={confirmState.title}
          message={confirmState.message}
          onConfirm={confirmState.onConfirm}
          onCancel={closeConfirm}
          isDanger={confirmState.isDanger}
      />

      <AnimatePresence>
          {isModalOpen && (
              <TeamMemberModal 
                  isOpen={isModalOpen}
                  isEdit={editMode}
                  initialData={userFormInitial}
                  onClose={() => setIsModalOpen(false)}
                  onSave={handleSaveUser}
              />
          )}
      </AnimatePresence>

      <AnimatePresence>
          {viewScheduleUser && (
              <>
                 <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setViewScheduleUser(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
                 <motion.div 
                    initial={{x: '100%'}} animate={{x:0}} exit={{x: '100%'}} 
                    className="fixed top-0 right-0 h-full w-96 bg-lumina-surface border-l border-lumina-highlight z-[110] p-6 shadow-2xl flex flex-col"
                 >
                     <div className="mb-6 flex justify-between items-start">
                         <div>
                             <h3 className="text-xl font-bold text-white">{viewScheduleUser.name}'s Schedule</h3>
                             <p className="text-sm text-lumina-muted">Upcoming assignments</p>
                         </div>
                         <button onClick={() => setViewScheduleUser(null)}><X className="text-lumina-muted hover:text-white"/></button>
                     </div>
                     
                     <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                         {getUserSchedule(viewScheduleUser.id).length === 0 ? (
                             <p className="text-center text-lumina-muted py-10 italic">No active tasks assigned.</p>
                         ) : (
                             getUserSchedule(viewScheduleUser.id).map(booking => (
                                 <div key={booking.id} className="p-4 bg-lumina-base border border-lumina-highlight rounded-xl">
                                     <div className="flex justify-between text-xs text-lumina-muted mb-1">
                                         <span>{booking.date}</span>
                                         <span className="text-lumina-accent font-bold">{booking.timeStart}</span>
                                     </div>
                                     <h4 className="font-bold text-white">{booking.clientName}</h4>
                                     <p className="text-sm text-lumina-muted">{booking.package}</p>
                                     <div className="mt-2 inline-block px-2 py-0.5 bg-lumina-highlight rounded text-[10px] uppercase">{booking.status}</div>
                                 </div>
                             ))
                         )}
                     </div>
                 </motion.div>
              </>
          )}
      </AnimatePresence>

      <AnimatePresence>
          {isAvailabilityModalOpen && (
              <TeamAvailabilityModal 
                  isOpen={isAvailabilityModalOpen}
                  user={selectedStaffForAvailability}
                  onClose={() => setIsAvailabilityModalOpen(false)}
                  onUpdateUser={(u) => { if(onUpdateUser) onUpdateUser(u); setSelectedStaffForAvailability(u); }}
              />
          )}
      </AnimatePresence>
    </div>
  );
};

export default TeamView;
