
import React, { useState } from 'react';
import { Booking, ProjectStatus, User, StudioConfig } from '../types';
import ProductionKanbanCard from '../components/production/ProductionKanbanCard';

interface ProductionViewProps {
  bookings: Booking[];
  onSelectBooking: (bookingId: string) => void; 
  currentUser?: User; 
  onUpdateBooking?: (booking: Booking) => void;
  config: StudioConfig; 
}

const ProductionView: React.FC<ProductionViewProps> = ({ bookings, onSelectBooking, currentUser, onUpdateBooking }) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'MINE'>('ALL');
  const [draggedBookingId, setDraggedBookingId] = useState<string | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<ProjectStatus | null>(null);

  const columns: { id: ProjectStatus; label: string; color: string }[] = [
    { id: 'SHOOTING', label: 'To Shoot', color: 'indigo' },
    { id: 'CULLING', label: 'Culling', color: 'purple' },
    { id: 'EDITING', label: 'Editing', color: 'pink' },
    { id: 'REVIEW', label: 'Review', color: 'amber' },
    { id: 'COMPLETED', label: 'Done', color: 'emerald' },
  ];

  const getColumnBookings = (status: ProjectStatus) => {
    return bookings.filter(b => {
        const statusMatch = b.status === status;
        if (filterMode === 'ALL') return statusMatch;
        // For 'MINE', check if user is photographer or editor
        const userMatch = (b.photographerId === currentUser?.id) || (b.editorId === currentUser?.id);
        return statusMatch && userMatch;
    }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const handleDragStart = (e: React.DragEvent, bookingId: string) => {
      setDraggedBookingId(bookingId);
      e.dataTransfer.setData('bookingId', bookingId);
  };

  const handleDragOver = (e: React.DragEvent, status: ProjectStatus) => {
      e.preventDefault();
      setActiveDropColumn(status);
  };

  const handleDrop = (e: React.DragEvent, status: ProjectStatus) => {
      e.preventDefault();
      const bookingId = e.dataTransfer.getData('bookingId');
      const booking = bookings.find(b => b.id === bookingId);
      
      if (booking && booking.status !== status && onUpdateBooking) {
          onUpdateBooking({ ...booking, status });
      }
      setActiveDropColumn(null);
      setDraggedBookingId(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Production Board</h1>
          <p className="text-lumina-muted">Track post-production workflow.</p>
        </div>
        <div className="bg-lumina-surface border border-lumina-highlight rounded-lg p-1 flex">
            <button 
                onClick={() => setFilterMode('ALL')}
                className={`px-4 py-2 text-xs font-bold rounded transition-colors ${filterMode === 'ALL' ? 'bg-lumina-highlight text-white' : 'text-lumina-muted hover:text-white'}`}
            >
                All Jobs
            </button>
            <button 
                onClick={() => setFilterMode('MINE')}
                className={`px-4 py-2 text-xs font-bold rounded transition-colors ${filterMode === 'MINE' ? 'bg-lumina-highlight text-white' : 'text-lumina-muted hover:text-white'}`}
            >
                My Tasks
            </button>
        </div>
      </div>

      {/* Kanban Board Container - Snap Scrolling for Mobile */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden flex gap-4 pb-4 snap-x snap-mandatory">
        {columns.map((col) => {
            const columnBookings = getColumnBookings(col.id);
            
            return (
                <div 
                    key={col.id}
                    onDragOver={(e) => handleDragOver(e, col.id)}
                    onDrop={(e) => handleDrop(e, col.id)}
                    className={`min-w-[85vw] md:min-w-[320px] flex-1 flex flex-col bg-lumina-surface/50 border border-lumina-highlight rounded-2xl transition-colors snap-center
                        ${activeDropColumn === col.id ? 'bg-lumina-highlight/30 border-lumina-accent/50' : ''}
                    `}
                >
                    {/* Column Header */}
                    <div className={`p-4 border-b border-lumina-highlight flex justify-between items-center sticky top-0 bg-lumina-surface/95 backdrop-blur-md z-10 rounded-t-2xl`}>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-${col.color}-500`}></div>
                            <h3 className="font-bold text-white text-sm">{col.label}</h3>
                        </div>
                        <span className="text-xs font-mono text-lumina-muted bg-lumina-base px-2 py-0.5 rounded">{columnBookings.length}</span>
                    </div>

                    {/* Scrollable Cards Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                        {columnBookings.map((booking) => (
                            <ProductionKanbanCard 
                                key={booking.id}
                                booking={booking}
                                currentUser={currentUser}
                                onSelect={onSelectBooking}
                                onDragStart={handleDragStart}
                            />
                        ))}
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default ProductionView;
