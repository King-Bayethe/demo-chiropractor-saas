export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar?: string;
  status: 'todo' | 'in_progress' | 'blocked' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  tags: string[];
  subtasks?: Array<{ id: string; title: string; completed: boolean }>;
}

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Review patient intake forms',
    description: 'Review and verify all new patient intake forms submitted this week',
    assigneeId: 'user1',
    assigneeName: 'Dr. Sarah Johnson',
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date().toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['admin', 'patients'],
    subtasks: [
      { id: 's1', title: 'Check insurance details', completed: true },
      { id: 's2', title: 'Verify contact information', completed: false }
    ]
  },
  {
    id: '2',
    title: 'Update SOAP notes for follow-ups',
    description: 'Complete SOAP notes for all follow-up appointments from yesterday',
    assigneeId: 'user2',
    assigneeName: 'Dr. Michael Chen',
    status: 'todo',
    priority: 'urgent',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['clinical', 'documentation'],
  },
  {
    id: '3',
    title: 'Schedule quarterly equipment maintenance',
    description: 'Arrange maintenance appointments for all treatment room equipment',
    assigneeId: 'user3',
    assigneeName: 'Lisa Martinez',
    status: 'completed',
    priority: 'medium',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['maintenance', 'facilities'],
  },
  {
    id: '4',
    title: 'Call patients for appointment confirmations',
    description: 'Confirm appointments for next week with all scheduled patients',
    assigneeId: 'user3',
    assigneeName: 'Lisa Martinez',
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['scheduling', 'patients'],
    subtasks: [
      { id: 's3', title: 'Monday appointments', completed: true },
      { id: 's4', title: 'Tuesday appointments', completed: true },
      { id: 's5', title: 'Wednesday appointments', completed: false }
    ]
  },
  {
    id: '5',
    title: 'Process insurance claims batch',
    description: 'Submit pending insurance claims for this billing period',
    assigneeId: 'user4',
    assigneeName: 'James Wilson',
    status: 'blocked',
    priority: 'high',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['billing', 'insurance'],
  },
  {
    id: '6',
    title: 'Order medical supplies',
    description: 'Restock treatment supplies and order new inventory',
    assigneeId: 'user3',
    assigneeName: 'Lisa Martinez',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['inventory', 'supplies'],
  },
  {
    id: '7',
    title: 'Update clinic policies document',
    description: 'Revise patient privacy and consent forms per new regulations',
    assigneeId: 'user1',
    assigneeName: 'Dr. Sarah Johnson',
    status: 'todo',
    priority: 'low',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['compliance', 'documentation'],
  },
  {
    id: '8',
    title: 'Train staff on new EMR features',
    description: 'Conduct training session for new electronic medical records features',
    assigneeId: 'user2',
    assigneeName: 'Dr. Michael Chen',
    status: 'completed',
    priority: 'medium',
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['training', 'technology'],
  }
];
