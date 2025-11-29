
import React from 'react';
import { motion } from 'framer-motion';
import { X, Printer, Aperture } from 'lucide-react';
import { Booking, StudioConfig } from '../types';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  config: StudioConfig;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, booking, config }) => {
  if (!isOpen || !booking) return null;

  // Determine Tax Rate
  const applicableTaxRate = booking.taxSnapshot !== undefined ? booking.taxSnapshot : (config.taxRate || 0);

  // Calculate Totals
  const items = booking.items && booking.items.length > 0 ? booking.items : [
      {
          id: 'legacy',
          description: `${booking.package} (${booking.duration} Hours)`,
          quantity: 1,
          unitPrice: booking.price,
          total: booking.price
      }
  ];
  
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  const discount = booking.discount || { type: 'FIXED', value: 0 };
  const discountAmount = discount.type === 'PERCENT' 
    ? subtotal * (discount.value / 100) 
    : discount.value;
    
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (subtotalAfterDiscount * applicableTaxRate) / 100;
  const totalAmount = subtotalAfterDiscount + taxAmount;
  const balanceDue = totalAmount - booking.paidAmount;

  // Custom Invoice ID Generator
  const generateInvoiceId = () => {
      const prefix = config.invoicePrefix || 'INV';
      const dateStr = booking.date.replace(/-/g, '');
      const uniqueSuffix = booking.id.substring(booking.id.length - 4).toUpperCase();
      return `${prefix}-${dateStr}-${uniqueSuffix}`;
  };

  const invoiceDate = booking.contractSignedDate 
    ? new Date(booking.contractSignedDate).toLocaleDateString() 
    : new Date(booking.date).toLocaleDateString();

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 print:p-0">
      {/* Optimized Print Styles */}
      <style>
        {`
          @media print {
            body {
                background-color: white !important;
            }
            body * { 
                visibility: hidden; 
            }
            #invoice-content, #invoice-content * { 
                visibility: visible; 
            }
            #invoice-content {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 40px !important;
                background-color: white !important;
                color: black !important;
                box-shadow: none !important;
                border-radius: 0 !important;
                overflow: visible !important;
                border: none !important;
            }
            .no-print { 
                display: none !important; 
            }
            /* Force High Contrast for Print */
            .print-black { color: #000000 !important; }
            .print-border { border-color: #000000 !important; }
            .print-bg-white { background-color: #ffffff !important; }
            
            /* Remove shadows and rounded corners for crisp print */
            * {
                box-shadow: none !important;
                text-shadow: none !important;
            }
          }
        `}
      </style>

      <div className="absolute inset-0 bg-black/90 backdrop-blur-md no-print" onClick={onClose}></div>
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-3xl h-[85vh] flex flex-col print:h-auto print:w-full print:shadow-none print:m-0"
      >
        <div className="flex justify-between items-center mb-4 text-white no-print">
            <h2 className="text-xl font-bold font-display">Invoice Preview</h2>
            <div className="flex items-center gap-2">
                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-lumina-accent text-lumina-base rounded-lg font-bold hover:bg-lumina-accent/90 transition-colors text-sm">
                    <Printer size={16} /> Print / Save as PDF
                </button>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg ml-2">
                    <X size={20} />
                </button>
            </div>
        </div>

        <div id="invoice-content" className="flex-1 bg-white text-stone-900 rounded-lg shadow-2xl overflow-y-auto custom-scrollbar relative font-sans print-bg-white">
            <div className="p-12 min-h-full flex flex-col justify-between">
                
                <div>
                    <div className="flex justify-between items-start border-b-2 border-stone-900 pb-8 mb-8 print-border">
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-stone-900 print-black">
                                {config.logoUrl ? (
                                    <img src={config.logoUrl} alt="Logo" className="h-10 w-auto" />
                                ) : (
                                    <Aperture className="w-8 h-8 print-black" />
                                )}
                                <span className="font-display font-bold text-2xl tracking-tight uppercase print-black">{config.name}</span>
                            </div>
                            <div className="text-sm text-stone-600 space-y-1 print-black">
                                <p>{config.address}</p>
                                <p>{config.phone}</p>
                                <p>{config.website}</p>
                                {config.npwp && <p className="text-xs mt-2 text-stone-400 print-black">NPWP: {config.npwp}</p>}
                            </div>
                        </div>
                        <div className="text-right">
                            <h1 className="text-5xl font-display font-bold text-stone-200 mb-2 print-black" style={{ color: '#e5e5e5' }}>INVOICE</h1>
                            <p className="text-stone-500 font-mono font-bold tracking-widest print-black">{generateInvoiceId()}</p>
                            <p className="text-sm font-bold text-stone-900 mt-2 print-black">Date: {invoiceDate}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 mb-12">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 print-black">Billed To</h3>
                            <p className="font-bold text-xl print-black">{booking.clientName}</p>
                            <p className="text-stone-600 print-black">{booking.clientPhone}</p>
                        </div>
                        <div>
                             <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 print-black">Project Details</h3>
                             <p className="font-bold print-black">{booking.package}</p>
                             <p className="text-stone-600 print-black">Session Date: {booking.date}</p>
                             <p className="text-stone-600 print-black">Studio: {booking.studio}</p>
                        </div>
                    </div>

                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b border-stone-300 print-border">
                                <th className="text-left py-3 text-sm font-bold uppercase text-stone-500 print-black">Description</th>
                                <th className="text-right py-3 text-sm font-bold uppercase text-stone-500 print-black">Price</th>
                                <th className="text-right py-3 text-sm font-bold uppercase text-stone-500 print-black">Qty</th>
                                <th className="text-right py-3 text-sm font-bold uppercase text-stone-500 print-black">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 print-border">
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td className="py-4">
                                        <p className="font-bold text-stone-800 print-black">{item.description}</p>
                                    </td>
                                    <td className="text-right py-4 font-mono text-stone-600 print-black">{item.unitPrice.toLocaleString('id-ID')}</td>
                                    <td className="text-right py-4 font-mono print-black">{item.quantity}</td>
                                    <td className="text-right py-4 font-mono font-bold print-black">Rp {item.total.toLocaleString('id-ID')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end mb-12">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-sm text-stone-600 print-black">
                                <span>Subtotal</span>
                                <span className="font-mono">Rp {subtotal.toLocaleString('id-ID')}</span>
                            </div>
                            
                            {discount.value > 0 && (
                                <div className="flex justify-between text-sm text-emerald-600 print-black">
                                    <span>Discount {discount.type === 'PERCENT' ? `(${discount.value}%)` : ''}</span>
                                    <span className="font-mono">- Rp {discountAmount.toLocaleString('id-ID')}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-sm text-stone-600 print-black">
                                <span>Tax (PPN {applicableTaxRate}%)</span>
                                <span className="font-mono">Rp {taxAmount.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="border-t border-stone-300 pt-3 flex justify-between font-bold text-lg print-border print-black">
                                <span>Total</span>
                                <span className="font-mono">Rp {totalAmount.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between text-sm text-emerald-600 font-bold print-black">
                                <span>Amount Paid</span>
                                <span className="font-mono">- Rp {booking.paidAmount.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="bg-stone-900 text-white p-3 rounded-lg flex justify-between font-bold text-xl mt-4 print-border print-black print-bg-white" style={{border: '2px solid black'}}>
                                <span>Balance Due</span>
                                <span className="font-mono">Rp {balanceDue.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-stone-200 pt-8 flex justify-between items-end print-border">
                    <div>
                        <h4 className="font-bold text-sm mb-2 print-black">Payment Methods</h4>
                        <div className="text-sm text-stone-600 print-black">
                            <p><span className="font-bold">Bank Name</span>: {config.bankName}</p>
                            <p><span className="font-bold">Account</span>: {config.bankAccount}</p>
                            <p><span className="font-bold">A/N</span>: {config.bankHolder}</p>
                        </div>
                        {config.invoiceFooter && (
                            <p className="text-xs text-stone-400 mt-4 italic max-w-sm print-black">{config.invoiceFooter}</p>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-stone-400 print-black">Authorized Signature</p>
                        <div className="h-16 flex items-end justify-end">
                            <p className="font-display font-bold text-lg print-black">{config.name}</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InvoiceModal;
