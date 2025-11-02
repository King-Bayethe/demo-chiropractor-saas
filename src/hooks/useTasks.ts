import { useState, useMemo } from 'react';
import { mockTasks, Task } from '@/utils/mockData/mockTasks';

export interface TaskFilters {
  search: string;
  assignees: string[];
  status: string[];
  priority: string[];
  tags: string[];
  dueDateFrom?: Date;
  dueDateTo?: Date;
}

export interface TaskStats {
  totalActive: number;
  overdue: number;
  dueToday: number;
  completionRate: number;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    assignees: [],
    status: [],
    priority: [],
    tags: [],
  });
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt' | 'title'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Calculate statistics
  const stats = useMemo((): TaskStats => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const activeTasks = tasks.filter(t => t.status !== 'completed');
    const overdue = tasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      return t.status !== 'completed' && dueDate < today;
    });
    const dueToday = tasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      return t.status !== 'completed' && 
        dueDate.getFullYear() === today.getFullYear() &&
        dueDate.getMonth() === today.getMonth() &&
        dueDate.getDate() === today.getDate();
    });
    const completedThisWeek = tasks.filter(t => {
      if (!t.completedAt) return false;
      const completedDate = new Date(t.completedAt);
      return completedDate >= weekAgo;
    });

    return {
      totalActive: activeTasks.length,
      overdue: overdue.length,
      dueToday: dueToday.length,
      completionRate: tasks.length > 0 ? (completedThisWeek.length / tasks.length) * 100 : 0,
    };
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search) ||
        t.assigneeName.toLowerCase().includes(search)
      );
    }

    // Assignee filter
    if (filters.assignees.length > 0) {
      result = result.filter(t => filters.assignees.includes(t.assigneeId));
    }

    // Status filter
    if (filters.status.length > 0) {
      result = result.filter(t => filters.status.includes(t.status));
    }

    // Priority filter
    if (filters.priority.length > 0) {
      result = result.filter(t => filters.priority.includes(t.priority));
    }

    // Tags filter
    if (filters.tags.length > 0) {
      result = result.filter(t => 
        t.tags.some(tag => filters.tags.includes(tag))
      );
    }

    // Date range filter
    if (filters.dueDateFrom) {
      result = result.filter(t => new Date(t.dueDate) >= filters.dueDateFrom!);
    }
    if (filters.dueDateTo) {
      result = result.filter(t => new Date(t.dueDate) <= filters.dueDateTo!);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'dueDate':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'priority': {
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        }
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tasks, filters, sortBy, sortOrder]);

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTaskComplete = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const isCompleting = t.status !== 'completed';
        return {
          ...t,
          status: isCompleting ? 'completed' : 'todo',
          completedAt: isCompleting ? new Date().toISOString() : undefined,
        };
      }
      return t;
    }));
  };

  return {
    tasks: filteredTasks,
    stats,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
  };
};
