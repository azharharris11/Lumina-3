

import { Account, Booking, Transaction, User, MonthlyMetric, Asset, Package, Client, Notification, StudioConfig } from './types';

export const STUDIO_CONFIG: StudioConfig = {
  name: 'LUMINA STUDIOS',
  address: 'Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan',
  phone: '+62 812 9988 7766',
  website: 'www.luminastudios.id',
  
  // Financial Defaults
  taxRate: 11, 
  requiredDownPaymentPercentage: 50, // Default 50% DP
  paymentDueDays: 0, // Due on day of shoot
  bankName: 'BCA',
  bankAccount: '883-291-001',
  bankHolder: 'PT Lumina Kreatif Indonesia',
  
  expenseCategories: [
      'Utilities & Rent',
      'Equipment Maint.',
      'Marketing / Ads',
      'Staff Salaries',
      'Consumables',
      'Transport',
      'Meals',
      'Other'
  ],

  // Inventory Defaults (NEW)
  assetCategories: [
      'CAMERA',
      'LENS',
      'LIGHTING',
      'PROP',
      'BACKGROUND',
      'AUDIO',
      'CABLES'
  ],

  // CRM Defaults (NEW)
  clientCategories: [
      'VIP',
      'REGULAR',
      'NEW',
      'PROBLEMATIC',
      'CORPORATE',
      'INFLUENCER'
  ],
  
  // Operational Defaults
  operatingHoursStart: '09:00',
  operatingHoursEnd: '21:00',
  bufferMinutes: 15, 
  defaultTurnaroundDays: 7,

  logoUrl: '', 
  npwp: '82.992.112.9-442.000',
  invoiceFooter: 'Payment is non-refundable. Reschedule allowed max 1x.',
  
  rooms: [
      { id: 'r1', name: 'STUDIO A', type: 'INDOOR', color: 'indigo' },
      { id: 'r2', name: 'STUDIO B', type: 'INDOOR', color: 'purple' },
      { id: 'r3', name: 'OUTDOOR', type: 'OUTDOOR', color: 'emerald' }
  ],
  templates: {
      booking: "Hi {clientName}, confirmed booking for {package} on {date} at {time}. Location: {studio}. Thanks!",
      reminder: "Hi {clientName}, reminder for payment of {balance}. Bank: {bankName} {bankAccount}.",
      thanks: "Thanks {clientName} for shooting with us!"
  },
  // Default Site Configuration
  site: {
      subdomain: 'lumina-jakarta',
      title: 'LUMINA STUDIOS',
      headline: 'Capturing Moments, Creating Legacy.',
      description: 'A premier photography studio in Jakarta specializing in portraiture, commercial, and editorial work.',
      theme: 'BOLD',
      heroImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop',
      showPricing: true,
      showTeam: true,
      showPortfolio: true,
      showBookingWidget: true, // Enabled by default
      isPublished: false,
      instagramUrl: 'https://instagram.com/lumina',
      gallery: [
        { id: 'g1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80', caption: 'Editorial' },
        { id: 'g2', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80', caption: 'Portrait' },
        { id: 'g3', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80', caption: 'Fashion' },
        { id: 'g4', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80', caption: 'Commercial' }
      ],
      seo: {
        title: 'Lumina Studios | Best Photography Studio in Jakarta',
        description: 'Professional photography services for weddings, fashion, and corporate events.',
        keywords: ['photography', 'jakarta', 'studio', 'wedding', 'fashion']
      },
      pixels: {
          facebookPixelId: '',
          googleTagId: '',
          tiktokPixelId: '',
          googleTagManagerId: ''
      },
      announcement: {
        enabled: true,
        text: '🎉 Book now for December and get 20% off all packages!',
        link: '#pricing',
        color: '#bef264', // lumina-accent
        textColor: '#0c0a09' // lumina-base
      },
      testimonials: [
          { id: 't1', clientName: 'Putri & Dimas', text: 'The team was incredibly professional and the photos turned out better than we could have imagined.', rating: 5 },
          { id: 't2', clientName: 'Fashion Weekly', text: 'Lumina provides the best editorial lighting in the city. A pleasure to work with.', rating: 5 }
      ],
      faq: [
          { id: 'f1', question: 'Do you provide raw files?', answer: 'For our Premium packages, raw files are included. For other packages, they can be purchased as an add-on.' },
          { id: 'f2', question: 'Can we bring pets?', answer: 'Yes! Studio A is pet-friendly. Please let us know in advance.' }
      ],
      beforeAfter: {
          enabled: true,
          beforeImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80&sat=-100', // Grayscale version
          afterImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80', // Color version
          label: 'Professional Retouching'
      },
      branding: {
          faviconUrl: '',
          socialShareImage: ''
      },
      pages: []
  }
};

export const USERS: User[] = [
    { id: 'u1', name: 'Alex Sander', role: 'OWNER', avatar: 'https://ui-avatars.com/api/?name=Alex+Sander&background=0D8ABC&color=fff', email: 'alex@lumina.id', phone: '081234567890', status: 'ACTIVE', joinedDate: '2023-01-01', commissionRate: 0, unavailableDates: [] },
    { id: 'u2', name: 'Sarah Miller', role: 'PHOTOGRAPHER', avatar: 'https://ui-avatars.com/api/?name=Sarah+Miller&background=random', email: 'sarah@lumina.id', phone: '081234567891', status: 'ACTIVE', specialization: 'Portrait', commissionRate: 15, joinedDate: '2023-02-15', unavailableDates: [] },
    { id: 'u3', name: 'Mike Ross', role: 'EDITOR', avatar: 'https://ui-avatars.com/api/?name=Mike+Ross&background=random', email: 'mike@lumina.id', phone: '081234567892', status: 'ACTIVE', specialization: 'Color Grading', commissionRate: 10, joinedDate: '2023-03-01', unavailableDates: [] },
    { id: 'u4', name: 'Jessica Lee', role: 'ADMIN', avatar: 'https://ui-avatars.com/api/?name=Jessica+Lee&background=random', email: 'jess@lumina.id', phone: '081234567893', status: 'ACTIVE', joinedDate: '2023-01-10', unavailableDates: [] }
];

export const ACCOUNTS: Account[] = [
    { id: 'acc1', name: 'Main Business Account', type: 'BANK', balance: 150000000, accountNumber: '883-291-001' },
    { id: 'acc2', name: 'Petty Cash', type: 'CASH', balance: 2500000 },
    { id: 'acc3', name: 'Operational Savings', type: 'BANK', balance: 50000000, accountNumber: '883-291-002' }
];

export const PACKAGES: Package[] = [
    { 
        id: 'p1', 
        name: 'Essentials', 
        price: 1500000, 
        duration: 1, 
        features: ['1 Hour Session', '10 Edited Photos', '1 Studio Background'], 
        active: true, 
        turnaroundDays: 5,
        costBreakdown: [
            { id: 'cost1', description: 'Studio Cleaning', amount: 25000, category: 'OTHER' },
            { id: 'cost2', description: 'Electricity & Utilities', amount: 50000, category: 'OTHER' }
        ]
    },
    { 
        id: 'p2', 
        name: 'Standard', 
        price: 2500000, 
        duration: 2, 
        features: ['2 Hour Session', '25 Edited Photos', '2 Studio Backgrounds', '1 Canvas Print'], 
        active: true, 
        turnaroundDays: 7,
        costBreakdown: [
            { id: 'cost3', description: 'Canvas Print 40x60', amount: 180000, category: 'MATERIAL' },
            { id: 'cost4', description: 'Freelance Assistant', amount: 150000, category: 'LABOR' },
            { id: 'cost5', description: 'Snacks & Drinks', amount: 50000, category: 'OTHER' }
        ]
    },
    { 
        id: 'p3', 
        name: 'Premium', 
        price: 5000000, 
        duration: 4, 
        features: ['4 Hour Session', 'All Raw Files', 'Unlimited Backgrounds', 'MUA Included', 'Lunch'], 
        active: true, 
        turnaroundDays: 14,
        costBreakdown: [
            { id: 'cost6', description: 'MUA Fee', amount: 750000, category: 'LABOR' },
            { id: 'cost7', description: 'Lunch Catering', amount: 150000, category: 'OTHER' },
            { id: 'cost8', description: 'Hard Drive (Deliverable)', amount: 200000, category: 'MATERIAL' },
            { id: 'cost9', description: 'Freelance Assistant', amount: 250000, category: 'LABOR' }
        ]
    }
];

export const ASSETS: Asset[] = [
    { id: 'a1', name: 'Sony A7IV', category: 'CAMERA', status: 'AVAILABLE', serialNumber: 'SN-9988221' },
    { id: 'a2', name: 'Canon R5', category: 'CAMERA', status: 'IN_USE', assignedToUserId: 'u2', serialNumber: 'SN-1122334', returnDate: '2023-11-30' },
    { id: 'a3', name: 'Godox AD600', category: 'LIGHTING', status: 'AVAILABLE', serialNumber: 'GDX-600-01' },
    { id: 'a4', name: 'Sigma 85mm f1.4', category: 'LENS', status: 'MAINTENANCE', notes: 'Focus ring stuck', serialNumber: 'SIG-85-99' }
];

export const CLIENTS: Client[] = [
    { id: 'c1', name: 'Budi Santoso', phone: '081122334455', email: 'budi@gmail.com', avatar: 'https://ui-avatars.com/api/?name=Budi+Santoso', category: 'REGULAR', notes: 'Likes bright lighting.', joinedDate: '2023-05-10' },
    { id: 'c2', name: 'Siti Aminah', phone: '081299887766', email: 'siti@yahoo.com', avatar: 'https://ui-avatars.com/api/?name=Siti+Aminah', category: 'VIP', notes: 'High spender, always books Premium.', joinedDate: '2023-06-15' },
    { id: 'c3', name: 'John Doe', phone: '085544332211', email: 'john@doe.com', avatar: 'https://ui-avatars.com/api/?name=John+Doe', category: 'PROBLEMATIC', notes: 'Often late for payment.', joinedDate: '2023-08-20' }
];

export const BOOKINGS: Booking[] = [
    { 
        id: 'b1', 
        clientName: 'Siti Aminah', 
        clientPhone: '081299887766', 
        clientId: 'c2',
        date: new Date().toISOString().split('T')[0], 
        timeStart: '10:00', 
        duration: 2, 
        package: 'Standard', 
        price: 2500000, 
        paidAmount: 2500000, 
        status: 'SHOOTING', 
        photographerId: 'u2', 
        studio: 'STUDIO A',
        contractStatus: 'SIGNED',
        items: [
            { id: 'i1', description: 'Standard Package', quantity: 1, unitPrice: 2500000, total: 2500000 }
        ],
        comments: [],
        discount: { type: 'FIXED', value: 0 },
        timeLogs: []
    },
    { 
        id: 'b2', 
        clientName: 'Budi Santoso', 
        clientPhone: '081122334455', 
        clientId: 'c1',
        date: new Date().toISOString().split('T')[0], 
        timeStart: '14:00', 
        duration: 1, 
        package: 'Essentials', 
        price: 1500000, 
        paidAmount: 500000, 
        status: 'BOOKED', 
        photographerId: 'u2', 
        studio: 'STUDIO B',
        contractStatus: 'PENDING',
        comments: [],
        discount: { type: 'FIXED', value: 0 },
        timeLogs: []
    }
];

export const TRANSACTIONS: Transaction[] = [
    { id: 't1', date: '2023-11-20T10:00:00Z', description: 'DP Booking - Siti Aminah', amount: 2500000, type: 'INCOME', accountId: 'acc1', category: 'Sales / Booking', status: 'COMPLETED', bookingId: 'b1' },
    { id: 't2', date: '2023-11-21T14:00:00Z', description: 'Monthly Electricity', amount: 1500000, type: 'EXPENSE', accountId: 'acc1', category: 'Utilities', status: 'COMPLETED' },
    { id: 't3', date: '2023-11-22T09:00:00Z', description: 'DP Booking - Budi Santoso', amount: 500000, type: 'INCOME', accountId: 'acc1', category: 'Sales / Booking', status: 'COMPLETED', bookingId: 'b2' }
];

export const NOTIFICATIONS: Notification[] = [
    { id: 'n1', title: 'System Update', message: 'Lumina v2.4.0 is live.', time: '2h ago', read: false, type: 'INFO' },
    { id: 'n2', title: 'New Booking', message: 'Budi Santoso booked Essentials.', time: '5h ago', read: false, type: 'SUCCESS' }
];