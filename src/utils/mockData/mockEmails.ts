export interface Email {
  id: string;
  subject: string;
  recipientIds: string[];
  recipientNames: string[];
  recipientType: 'individual' | 'group' | 'all_patients';
  campaignType: 'newsletter' | 'appointment_reminder' | 'follow_up' | 'marketing' | 'custom';
  bodyHtml: string;
  bodyText: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduledFor?: string;
  sentAt?: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    url: string;
    size: number;
  }>;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    openRate: number;
    clickRate: number;
  };
}

export const mockEmails: Email[] = [
  {
    id: '1',
    subject: 'Appointment Reminder - Tomorrow at 2:00 PM',
    recipientIds: ['p1'],
    recipientNames: ['John Smith'],
    recipientType: 'individual',
    campaignType: 'appointment_reminder',
    bodyHtml: '<p>Hi John,</p><p>This is a friendly reminder about your appointment tomorrow at 2:00 PM with Dr. Sarah Johnson.</p><p>Please arrive 10 minutes early to complete any necessary paperwork.</p>',
    bodyText: 'Hi John,\n\nThis is a friendly reminder about your appointment tomorrow at 2:00 PM with Dr. Sarah Johnson.\n\nPlease arrive 10 minutes early to complete any necessary paperwork.',
    status: 'sent',
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    fromName: 'Chiropractic Clinic',
    fromEmail: 'appointments@clinic.com',
    replyTo: 'frontdesk@clinic.com',
    metrics: {
      sent: 1,
      delivered: 1,
      opened: 1,
      clicked: 0,
      bounced: 0,
      openRate: 100,
      clickRate: 0
    }
  },
  {
    id: '2',
    subject: 'Monthly Wellness Newsletter - March 2024',
    recipientIds: ['p1', 'p2', 'p3', 'p4', 'p5'],
    recipientNames: ['John Smith', 'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Williams'],
    recipientType: 'all_patients',
    campaignType: 'newsletter',
    bodyHtml: '<h1>March Wellness Tips</h1><p>Spring is here! Check out our latest health tips and clinic updates.</p><ul><li>New treatment options available</li><li>Spring cleaning for your spine</li><li>Exercise tips for warmer weather</li></ul>',
    bodyText: 'March Wellness Tips\n\nSpring is here! Check out our latest health tips and clinic updates.\n\n- New treatment options available\n- Spring cleaning for your spine\n- Exercise tips for warmer weather',
    status: 'sent',
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    fromName: 'Dr. Sarah Johnson',
    fromEmail: 'newsletter@clinic.com',
    replyTo: 'info@clinic.com',
    metrics: {
      sent: 5,
      delivered: 5,
      opened: 3,
      clicked: 2,
      bounced: 0,
      openRate: 60,
      clickRate: 40
    }
  },
  {
    id: '3',
    subject: 'Follow-up: How are you feeling?',
    recipientIds: ['p2'],
    recipientNames: ['Sarah Johnson'],
    recipientType: 'individual',
    campaignType: 'follow_up',
    bodyHtml: '<p>Hi Sarah,</p><p>We hope you\'re feeling better after your recent treatment session. Please let us know if you have any questions or concerns.</p><p>Your next appointment is scheduled for next week.</p>',
    bodyText: 'Hi Sarah,\n\nWe hope you\'re feeling better after your recent treatment session. Please let us know if you have any questions or concerns.\n\nYour next appointment is scheduled for next week.',
    status: 'sent',
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    fromName: 'Dr. Michael Chen',
    fromEmail: 'drchen@clinic.com',
    replyTo: 'drchen@clinic.com',
    metrics: {
      sent: 1,
      delivered: 1,
      opened: 1,
      clicked: 1,
      bounced: 0,
      openRate: 100,
      clickRate: 100
    }
  },
  {
    id: '4',
    subject: 'Special Offer: 15% Off Wellness Packages',
    recipientIds: ['p1', 'p3', 'p5', 'p6', 'p7', 'p8'],
    recipientNames: ['John Smith', 'Michael Chen', 'David Williams', 'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez'],
    recipientType: 'group',
    campaignType: 'marketing',
    bodyHtml: '<h2>Spring Wellness Special</h2><p>For a limited time, enjoy 15% off all wellness packages!</p><p><a href="https://clinic.com/offers">View Packages</a></p><p>Offer expires March 31st.</p>',
    bodyText: 'Spring Wellness Special\n\nFor a limited time, enjoy 15% off all wellness packages!\n\nView Packages: https://clinic.com/offers\n\nOffer expires March 31st.',
    status: 'sent',
    sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    fromName: 'Chiropractic Clinic',
    fromEmail: 'offers@clinic.com',
    replyTo: 'info@clinic.com',
    metrics: {
      sent: 6,
      delivered: 6,
      opened: 4,
      clicked: 2,
      bounced: 0,
      openRate: 66.7,
      clickRate: 33.3
    }
  },
  {
    id: '5',
    subject: 'Upcoming: Patient Appreciation Day',
    recipientIds: [],
    recipientNames: [],
    recipientType: 'all_patients',
    campaignType: 'custom',
    bodyHtml: '<h1>Patient Appreciation Day - April 15th</h1><p>Join us for refreshments, free consultations, and special discounts!</p>',
    bodyText: 'Patient Appreciation Day - April 15th\n\nJoin us for refreshments, free consultations, and special discounts!',
    status: 'scheduled',
    scheduledFor: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    fromName: 'Chiropractic Clinic',
    fromEmail: 'events@clinic.com',
    replyTo: 'info@clinic.com',
    metrics: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      openRate: 0,
      clickRate: 0
    }
  },
  {
    id: '6',
    subject: 'Your Payment Receipt',
    recipientIds: ['p4'],
    recipientNames: ['Emily Rodriguez'],
    recipientType: 'individual',
    campaignType: 'custom',
    bodyHtml: '<p>Dear Emily,</p><p>Thank you for your payment of $367.20.</p><p>Your receipt is attached.</p>',
    bodyText: 'Dear Emily,\n\nThank you for your payment of $367.20.\n\nYour receipt is attached.',
    status: 'sent',
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    fromName: 'Chiropractic Clinic Billing',
    fromEmail: 'billing@clinic.com',
    replyTo: 'billing@clinic.com',
    attachments: [
      {
        filename: 'receipt-INV-2024-004.pdf',
        url: '/receipts/receipt-INV-2024-004.pdf',
        size: 45000
      }
    ],
    metrics: {
      sent: 1,
      delivered: 1,
      opened: 1,
      clicked: 1,
      bounced: 0,
      openRate: 100,
      clickRate: 100
    }
  },
  {
    id: '7',
    subject: 'Draft: Summer Health Tips',
    recipientIds: [],
    recipientNames: [],
    recipientType: 'all_patients',
    campaignType: 'newsletter',
    bodyHtml: '<h1>Summer Health Tips</h1><p>Stay healthy this summer with these tips...</p>',
    bodyText: 'Summer Health Tips\n\nStay healthy this summer with these tips...',
    status: 'draft',
    fromName: 'Dr. Sarah Johnson',
    fromEmail: 'newsletter@clinic.com',
    replyTo: 'info@clinic.com',
    metrics: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      openRate: 0,
      clickRate: 0
    }
  }
];
