
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, History, CheckSquare, FileInput, MessageCircle } from 'lucide-react';
import { Booking, Account, StudioConfig } from '../../types';

const Motion = motion as any;

interface FinanceInvoicesProps {
    bookings: Booking[];
    config: StudioConfig;
    accounts: Account[];
    onSettle: (bookingId: string, amount: number, maxAmount: number, currentPaid: number, mode: 'PAYMENT' | 'REFUND') => void;
    onInvoice: (booking: Booking) => void;
    onWhatsApp: (booking: Booking) => void;
}

const FinanceInvoices: React.FC<FinanceInvoicesProps> = ({ bookings, config, accounts, onSettle, onInvoice, onWhatsApp }) => {
    const [invoiceFilter, setInvoiceFilter] = useState<'UNPAID' | 'PAID'>('UNPAID');

    const getBookingFinancials = (b: any) => {
        const applicableTaxRate = b.taxSnapshot !== undefined ? b.taxSnapshot : (config.taxRate || 0);
        let subtotal = b.price;
        if (b.items && b.items.length > 0) {
            subtotal = b.items.reduce((acc: number, item: any) => acc + item.total, 0);
        }
        let discountAmount = 0;
        if (b.discount) {
            discountAmount = b.discount.type === 'PERCENT' ? subtotal * (b.discount.value / 100) : b.discount.value;
        }
        const afterDiscount = Math.max(0, subtotal - discountAmount);
        const taxAmount = afterDiscount * (applicableTaxRate / 100);
        const grandTotal = afterDiscount + taxAmount;
        const dueAmount = grandTotal - b.paidAmount;
        return { grandTotal, dueAmount };
    };

    const isOverdue = (dateStr: string) => {
        const due = new Date(dateStr);
        due.setDate(due.getDate() + (config.paymentDueDays || 0));
        return new Date() > due;
    };

    const unpaidBookings = bookings.filter(b => {
        const { dueAmount } = getBookingFinancials(b);
        return dueAmount > 100 && b.status !== 'CANCELLED'; 
    });
  
    const paidBookings = bookings.filter(b => {
        const { dueAmount } = getBookingFinancials(b);
        return dueAmount <= 100 && b.status !== 'CANCELLED';
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
    const displayBookings = invoiceFilter === 'UNPAID' ? unpaidBookings : paidBookings;

    return (
        <Motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-lumina-surface border border-lumina-highlight p-4 rounded-xl gap-4">
                <div className="flex bg-lumina-base p-1 rounded-lg border border-lumina-highlight w-full md:w-auto">
                    <button 
                        onClick={() => setInvoiceFilter('UNPAID')}
                        className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${invoiceFilter === 'UNPAID' ? 'bg-lumina-highlight text-white' : 'text-lumina-muted hover:text-white'}`}
                    >
                        <AlertCircle size={14} /> Outstanding
                    </button>
                    <button 
                        onClick={() => setInvoiceFilter('PAID')}
                        className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${invoiceFilter === 'PAID' ? 'bg-lumina-highlight text-emerald-400' : 'text-lumina-muted hover:text-white'}`}
                    >
                        <History size={14} /> Paid History
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayBookings.map((booking) => {
                    const { grandTotal, dueAmount } = getBookingFinancials(booking);
                    const percentagePaid = grandTotal > 0 ? (booking.paidAmount / grandTotal) * 100 : 100;
                    const isFullyPaid = dueAmount <= 100;
                    const overdue = isOverdue(booking.date);

                    return (
                        <div key={booking.id} className={`bg-lumina-surface border rounded-2xl p-6 relative overflow-hidden group transition-all
                            ${isFullyPaid ? 'border-emerald-500/20' : overdue ? 'border-rose-500/30 shadow-rose-500/5' : 'border-lumina-highlight hover:border-lumina-accent/50'}
                        `}>
                            {overdue && !isFullyPaid && (
                                <div className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg z-10">OVERDUE</div>
                            )}
                            
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-white text-lg">{booking.clientName}</h3>
                                    <p className="text-xs text-lumina-muted">{booking.package} • {new Date(booking.date).toLocaleDateString()}</p>
                                </div>
                                {!isFullyPaid && (
                                    <button 
                                        onClick={() => onSettle(booking.id, dueAmount, dueAmount, booking.paidAmount, 'PAYMENT')}
                                        className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/20 transition-colors"
                                        title="Quick Settle (Full Amount)"
                                    >
                                        <CheckSquare size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs text-lumina-muted mb-1">
                                        <span className={isFullyPaid ? "text-emerald-500 font-bold" : ""}>{isFullyPaid ? 'Paid in Full' : `Paid: ${percentagePaid.toFixed(0)}%`}</span>
                                        <span>Total: Rp {grandTotal.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="w-full h-2 bg-lumina-base border border-lumina-highlight rounded-full overflow-hidden">
                                        <div className={`h-full ${isFullyPaid ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${percentagePaid}%` }}></div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center py-3 border-t border-lumina-highlight/30">
                                    <span className="text-sm text-lumina-muted">Balance Due</span>
                                    <span className={`text-xl font-mono font-bold ${isFullyPaid ? 'text-emerald-500' : 'text-rose-400'}`}>
                                        Rp {dueAmount.toLocaleString('id-ID')}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <div className="flex gap-2 flex-1">
                                        <button onClick={() => onInvoice(booking)} className="flex-1 py-2 bg-lumina-base hover:bg-lumina-highlight text-white text-xs font-bold rounded-lg border border-lumina-highlight flex items-center justify-center gap-1">
                                            <FileInput size={14}/> Invoice
                                        </button>
                                        <button onClick={() => onWhatsApp(booking)} className="py-2 px-3 bg-lumina-highlight hover:bg-emerald-500/20 hover:text-emerald-400 text-white text-xs font-bold rounded-lg border border-lumina-highlight transition-colors">
                                            <MessageCircle size={14} />
                                        </button>
                                    </div>
                                    {isFullyPaid && (
                                        <button 
                                            onClick={() => onSettle(booking.id, 0, 0, booking.paidAmount, 'REFUND')}
                                            className="py-2 px-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 text-xs font-bold"
                                        >
                                            Refund
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
                {displayBookings.length === 0 && (
                    <p className="col-span-full text-center text-lumina-muted py-10">No {invoiceFilter.toLowerCase()} invoices found.</p>
                )}
            </div>
        </Motion.div>
    );
};

export default FinanceInvoices;
