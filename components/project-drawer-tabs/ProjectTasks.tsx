
import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { Booking, BookingTask } from '../../types';

interface ProjectTasksProps {
  booking: Booking;
  onUpdateBooking: (booking: Booking) => void;
}

const ProjectTasks: React.FC<ProjectTasksProps> = ({ booking, onUpdateBooking }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = () => { 
      if (booking && newTaskTitle) { 
          const task: BookingTask = { id: `t-${Date.now()}`, title: newTaskTitle, completed: false }; 
          onUpdateBooking({ ...booking, tasks: [...(booking.tasks || []), task] }); 
          setNewTaskTitle(''); 
      } 
  };

  const handleToggleTask = (taskId: string) => { 
      if (booking && booking.tasks) { 
          const updatedTasks = booking.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t); 
          onUpdateBooking({ ...booking, tasks: updatedTasks }); 
      } 
  };

  return (
    <div className="bg-lumina-surface border border-lumina-highlight rounded-2xl p-6 max-w-3xl mx-auto">
        <div className="flex gap-2 mb-6">
            <input 
                className="flex-1 bg-lumina-base border border-lumina-highlight rounded-xl px-4 py-3 text-sm text-white focus:border-lumina-accent outline-none"
                placeholder="Add a new task..."
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTask()}
            />
            <button onClick={handleAddTask} className="bg-lumina-highlight hover:bg-lumina-accent hover:text-lumina-base text-white p-3 rounded-xl transition-colors">
                <Plus size={20} />
            </button>
        </div>
        <div className="space-y-2">
            {(booking.tasks || []).map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 hover:bg-lumina-base/50 rounded-lg transition-colors group">
                    <button 
                        onClick={() => handleToggleTask(task.id)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                            ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-lumina-muted text-transparent hover:border-emerald-500'}
                        `}
                    >
                        <Check size={14} />
                    </button>
                    <span className={`text-sm flex-1 ${task.completed ? 'text-lumina-muted line-through' : 'text-white'}`}>{task.title}</span>
                </div>
            ))}
        </div>
    </div>
  );
};

export default ProjectTasks;
