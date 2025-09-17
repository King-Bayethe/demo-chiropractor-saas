export interface MockMessage {
  id: string;
  content: string;
  sender: 'patient' | 'provider' | 'system';
  sender_name: string;
  timestamp: string;
  type: 'text' | 'image' | 'document' | 'appointment' | 'system';
  status: 'sent' | 'delivered' | 'read';
  metadata?: {
    attachment_url?: string;
    appointment_id?: string;
    document_type?: string;
  };
}

export interface MockConversation {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  status: 'active' | 'archived' | 'urgent';
  conversation_type: 'sms' | 'email' | 'call' | 'portal';
  case_type: string;
  messages: MockMessage[];
  created_at: string;
  updated_at: string;
}

const today = new Date();
const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
const thisHour = new Date(today.getTime() - 30 * 60 * 1000);

export const mockConversations: MockConversation[] = [
  {
    id: "conv-1",
    patient_id: "1",
    patient_name: "Maria Rodriguez",
    patient_phone: "(555) 123-4567",
    patient_email: "maria.rodriguez@email.com",
    last_message: "Thank you for the treatment today. The pain is much better!",
    last_message_time: thisHour.toISOString(),
    unread_count: 0,
    status: "active",
    conversation_type: "sms",
    case_type: "PIP",
    created_at: lastWeek.toISOString(),
    updated_at: thisHour.toISOString(),
    messages: [
      {
        id: "msg-1-1",
        content: "Hello, this is Maria Rodriguez. I have my appointment tomorrow at 9 AM. Should I arrive early?",
        sender: "patient",
        sender_name: "Maria Rodriguez",
        timestamp: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        type: "text",
        status: "read"
      },
      {
        id: "msg-1-2", 
        content: "Hi Maria! Yes, please arrive 15 minutes early to complete any necessary paperwork. See you tomorrow!",
        sender: "provider",
        sender_name: "Dr. Sarah Johnson",
        timestamp: new Date(today.getTime() - 90 * 60 * 1000).toISOString(),
        type: "text", 
        status: "read"
      },
      {
        id: "msg-1-3",
        content: "Perfect, thank you! Also, should I bring my insurance card?",
        sender: "patient",
        sender_name: "Maria Rodriguez", 
        timestamp: new Date(today.getTime() - 80 * 60 * 1000).toISOString(),
        type: "text",
        status: "read"
      },
      {
        id: "msg-1-4",
        content: "Yes, please bring your PIP insurance information and driver's license. We'll handle the rest!",
        sender: "provider",
        sender_name: "Dr. Sarah Johnson",
        timestamp: new Date(today.getTime() - 70 * 60 * 1000).toISOString(),
        type: "text",
        status: "read"
      },
      {
        id: "msg-1-5",
        content: "Thank you for the treatment today. The pain is much better!",
        sender: "patient", 
        sender_name: "Maria Rodriguez",
        timestamp: thisHour.toISOString(),
        type: "text",
        status: "delivered"
      }
    ]
  },
  {
    id: "conv-2",
    patient_id: "2", 
    patient_name: "James Thompson",
    patient_phone: "(555) 234-5678",
    patient_email: "james.thompson@email.com",
    last_message: "Appointment reminder: You have a cervical manipulation session tomorrow at 11:30 AM",
    last_message_time: new Date(today.getTime() - 4 * 60 * 60 * 1000).toISOString(),
    unread_count: 1,
    status: "active",
    conversation_type: "sms",
    case_type: "Workers Comp",
    created_at: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(today.getTime() - 4 * 60 * 60 * 1000).toISOString(),
    messages: [
      {
        id: "msg-2-1",
        content: "Hi Dr. Chen, I'm feeling much better after last week's session. The neck pain has reduced significantly.",
        sender: "patient",
        sender_name: "James Thompson",
        timestamp: new Date(today.getTime() - 6 * 60 * 60 * 1000).toISOString(), 
        type: "text",
        status: "read"
      },
      {
        id: "msg-2-2",
        content: "That's excellent news, James! We'll continue with the current treatment plan tomorrow.",
        sender: "provider",
        sender_name: "Dr. Michael Chen",
        timestamp: new Date(today.getTime() - 5 * 60 * 60 * 1000).toISOString(),
        type: "text",
        status: "read"
      },
      {
        id: "msg-2-3",
        content: "Appointment reminder: You have a cervical manipulation session tomorrow at 11:30 AM",
        sender: "system",
        sender_name: "Clinic System",
        timestamp: new Date(today.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        type: "appointment",
        status: "sent",
        metadata: {
          appointment_id: "apt-2"
        }
      }
    ]
  },
  {
    id: "conv-3",
    patient_id: "3",
    patient_name: "Linda Davis", 
    patient_phone: "(555) 345-6789",
    patient_email: "linda.davis@email.com",
    last_message: "I can't make it to my appointment today due to knee swelling. Can we reschedule?",
    last_message_time: new Date(today.getTime() - 8 * 60 * 60 * 1000).toISOString(),
    unread_count: 3,
    status: "urgent",
    conversation_type: "sms", 
    case_type: "Sports Injury",
    created_at: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(today.getTime() - 8 * 60 * 60 * 1000).toISOString(),
    messages: [
      {
        id: "msg-3-1",
        content: "Hi, I noticed my knee is more swollen today than yesterday. Should I be concerned?",
        sender: "patient",
        sender_name: "Linda Davis",
        timestamp: new Date(today.getTime() - 10 * 60 * 60 * 1000).toISOString(),
        type: "text",
        status: "sent"
      },
      {
        id: "msg-3-2",
        content: "Some swelling is normal after surgery, but let's monitor it closely. Are you keeping it elevated?",
        sender: "provider",
        sender_name: "Dr. James Wilson",
        timestamp: new Date(today.getTime() - 9 * 60 * 60 * 1000).toISOString(),
        type: "text",
        status: "read"
      },
      {
        id: "msg-3-3",
        content: "I can't make it to my appointment today due to knee swelling. Can we reschedule?",
        sender: "patient",
        sender_name: "Linda Davis",
        timestamp: new Date(today.getTime() - 8 * 60 * 60 * 1000).toISOString(),
        type: "text",
        status: "sent"
      }
    ]
  },
  {
    id: "conv-4", 
    patient_id: "4",
    patient_name: "Robert Martinez",
    patient_phone: "(555) 456-7890",
    patient_email: "robert.martinez@email.com",
    last_message: "Blood sugar levels are stable at 110. Ready for injection procedure.",
    last_message_time: yesterday.toISOString(),
    unread_count: 0,
    status: "active",
    conversation_type: "portal",
    case_type: "Chronic Pain",
    created_at: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: yesterday.toISOString(),
    messages: [
      {
        id: "msg-4-1",
        content: "Dr. Rodriguez, my endocrinologist cleared me for the steroid injection. My latest HbA1c is 6.8%.",
        sender: "patient",
        sender_name: "Robert Martinez",
        timestamp: new Date(yesterday.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        type: "text", 
        status: "read"
      },
      {
        id: "msg-4-2",
        content: "Excellent! That's within our target range. Please monitor your blood sugar closely after the injection.",
        sender: "provider",
        sender_name: "Dr. Emily Rodriguez",
        timestamp: new Date(yesterday.getTime() - 60 * 60 * 1000).toISOString(),
        type: "text",
        status: "read"
      },
      {
        id: "msg-4-3",
        content: "Blood sugar levels are stable at 110. Ready for injection procedure.",
        sender: "patient",
        sender_name: "Robert Martinez", 
        timestamp: yesterday.toISOString(),
        type: "text",
        status: "delivered"
      }
    ]
  },
  {
    id: "conv-5",
    patient_id: "5",
    patient_name: "Amanda Wilson",
    patient_phone: "(555) 567-8901", 
    patient_email: "amanda.wilson@email.com",
    last_message: "Exercise plan attached. Start with gentle movements and progress as tolerated.",
    last_message_time: new Date(today.getTime() - 12 * 60 * 60 * 1000).toISOString(),
    unread_count: 1,
    status: "active",
    conversation_type: "email",
    case_type: "Postpartum Care",
    created_at: new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(today.getTime() - 12 * 60 * 60 * 1000).toISOString(),
    messages: [
      {
        id: "msg-5-1",
        content: "Hi Lisa, I'm struggling with the core exercises. They seem to make my back pain worse.",
        sender: "patient",
        sender_name: "Amanda Wilson",
        timestamp: new Date(today.getTime() - 14 * 60 * 60 * 1000).toISOString(),
        type: "text",
        status: "read"
      },
      {
        id: "msg-5-2",
        content: "That's common in early postpartum recovery. Let's modify the exercises to be more gentle.", 
        sender: "provider",
        sender_name: "Lisa Thompson, PT",
        timestamp: new Date(today.getTime() - 13 * 60 * 60 * 1000).toISOString(),
        type: "text",
        status: "read"
      },
      {
        id: "msg-5-3",
        content: "Exercise plan attached. Start with gentle movements and progress as tolerated.",
        sender: "provider",
        sender_name: "Lisa Thompson, PT",
        timestamp: new Date(today.getTime() - 12 * 60 * 60 * 1000).toISOString(),
        type: "document",
        status: "sent",
        metadata: {
          document_type: "exercise_plan",
          attachment_url: "/documents/postpartum-exercises.pdf"
        }
      }
    ]
  },
  {
    id: "conv-6",
    patient_id: "new-1",
    patient_name: "David Chen",
    patient_phone: "(555) 678-9012",
    patient_email: "david.chen@email.com", 
    last_message: "Welcome to our clinic! Your new patient appointment is confirmed for Friday at 2 PM.",
    last_message_time: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    unread_count: 2,
    status: "active",
    conversation_type: "sms",
    case_type: "PIP - New",
    created_at: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    messages: [
      {
        id: "msg-6-1",
        content: "Hi, I was referred by Attorney Johnson for my car accident injuries. Can I schedule an appointment?",
        sender: "patient",
        sender_name: "David Chen",
        timestamp: new Date(today.getTime() - 26 * 60 * 60 * 1000).toISOString(),
        type: "text",
        status: "read"
      },
      {
        id: "msg-6-2",
        content: "Welcome to our clinic! Your new patient appointment is confirmed for Friday at 2 PM.",
        sender: "provider",
        sender_name: "Front Desk",
        timestamp: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        type: "appointment", 
        status: "sent",
        metadata: {
          appointment_id: "apt-9"
        }
      }
    ]
  }
];