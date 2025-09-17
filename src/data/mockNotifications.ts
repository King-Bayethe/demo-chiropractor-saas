export interface MockNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'appointment' | 'payment' | 'system';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
  entity_type?: string;
  entity_id?: string;
  created_at: string;
  updated_at: string;
  delivery_status: {
    in_app: { delivered: boolean; read: boolean };
    push: { attempted: boolean; delivered: boolean };
    email: { attempted: boolean; delivered: boolean };
  };
}

const now = new Date();
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
const thisAfternoon = new Date(now.getTime() - 4 * 60 * 60 * 1000);
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

export const mockNotifications: MockNotification[] = [
  {
    id: "notif-1",
    user_id: "demo-user-id",
    title: "New Patient Appointment",
    message: "David Chen has scheduled a new patient consultation for Friday at 2:00 PM",
    type: "appointment",
    priority: "normal",
    read: false,
    entity_type: "appointment",
    entity_id: "apt-9",
    created_at: oneHourAgo.toISOString(),
    updated_at: oneHourAgo.toISOString(),
    delivery_status: {
      in_app: { delivered: true, read: false },
      push: { attempted: true, delivered: true },
      email: { attempted: false, delivered: false }
    }
  },
  {
    id: "notif-2",
    user_id: "demo-user-id", 
    title: "Payment Received",
    message: "Payment of $450.00 received from Maria Rodriguez (PIP Insurance)",
    type: "payment",
    priority: "normal",
    read: false,
    entity_type: "invoice",
    entity_id: "inv-1",
    created_at: twoHoursAgo.toISOString(),
    updated_at: twoHoursAgo.toISOString(),
    delivery_status: {
      in_app: { delivered: true, read: false },
      push: { attempted: true, delivered: true },
      email: { attempted: true, delivered: true }
    }
  },
  {
    id: "notif-3",
    user_id: "demo-user-id",
    title: "Urgent: Patient Needs Attention",
    message: "Linda Davis reports increased knee swelling and cannot attend today's appointment",
    type: "warning",
    priority: "urgent",
    read: false,
    entity_type: "conversation",
    entity_id: "conv-3",
    created_at: thisAfternoon.toISOString(),
    updated_at: thisAfternoon.toISOString(),
    delivery_status: {
      in_app: { delivered: true, read: false },
      push: { attempted: true, delivered: true },
      email: { attempted: true, delivered: true }
    }
  },
  {
    id: "notif-4",
    user_id: "demo-user-id",
    title: "Lab Results Available",
    message: "MRI results for Robert Martinez are ready for review",
    type: "info",
    priority: "normal",
    read: true,
    entity_type: "document",
    entity_id: "doc-9",
    created_at: yesterday.toISOString(),
    updated_at: yesterday.toISOString(),
    delivery_status: {
      in_app: { delivered: true, read: true },
      push: { attempted: true, delivered: true },
      email: { attempted: false, delivered: false }
    }
  },
  {
    id: "notif-5",
    user_id: "demo-user-id",
    title: "Appointment Reminder",
    message: "Reminder: James Thompson has cervical manipulation scheduled tomorrow at 11:30 AM",
    type: "appointment",
    priority: "normal",
    read: true,
    entity_type: "appointment",
    entity_id: "apt-2",
    created_at: yesterday.toISOString(),
    updated_at: yesterday.toISOString(),
    delivery_status: {
      in_app: { delivered: true, read: true },
      push: { attempted: true, delivered: true },
      email: { attempted: false, delivered: false }
    }
  },
  {
    id: "notif-6",
    user_id: "demo-user-id",
    title: "System Maintenance Complete",
    message: "Scheduled system maintenance has been completed successfully. All services are fully operational.",
    type: "system",
    priority: "low",
    read: true,
    created_at: twoDaysAgo.toISOString(),
    updated_at: twoDaysAgo.toISOString(),
    delivery_status: {
      in_app: { delivered: true, read: true },
      push: { attempted: false, delivered: false },
      email: { attempted: true, delivered: true }
    }
  },
  {
    id: "notif-7",
    user_id: "demo-user-id",
    title: "Insurance Authorization Approved",
    message: "Workers Compensation authorization approved for James Thompson - Additional 6 treatments authorized",
    type: "success",
    priority: "normal",
    read: true,
    entity_type: "patient",
    entity_id: "2",
    created_at: twoDaysAgo.toISOString(),
    updated_at: twoDaysAgo.toISOString(),
    delivery_status: {
      in_app: { delivered: true, read: true },
      push: { attempted: true, delivered: true },
      email: { attempted: true, delivered: true }
    }
  },
  {
    id: "notif-8",
    user_id: "demo-user-id",
    title: "Overdue Invoice Alert",
    message: "Invoice INV-2024-008 for James Thompson is now overdue ($315.00)",
    type: "warning",
    priority: "high",
    read: false,
    entity_type: "invoice",
    entity_id: "inv-8",
    created_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    delivery_status: {
      in_app: { delivered: true, read: false },
      push: { attempted: true, delivered: true },
      email: { attempted: true, delivered: true }
    }
  },
  {
    id: "notif-9",
    user_id: "demo-user-id",
    title: "New Message from Patient",
    message: "Amanda Wilson sent a message about her exercise plan difficulties",
    type: "info",
    priority: "normal",
    read: true,
    entity_type: "conversation",
    entity_id: "conv-5",
    created_at: new Date(now.getTime() - 14 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 14 * 60 * 60 * 1000).toISOString(),
    delivery_status: {
      in_app: { delivered: true, read: true },
      push: { attempted: true, delivered: true },
      email: { attempted: false, delivered: false }
    }
  },
  {
    id: "notif-10",
    user_id: "demo-user-id",
    title: "Weekly Revenue Report",
    message: "Your weekly revenue summary is ready for review. Total: $2,450.00",
    type: "info",
    priority: "low",
    read: false,
    created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    delivery_status: {
      in_app: { delivered: true, read: false },
      push: { attempted: false, delivered: false },
      email: { attempted: true, delivered: true }
    }
  }
];