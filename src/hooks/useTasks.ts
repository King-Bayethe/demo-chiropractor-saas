import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/utils/mockData/mockTasks';
import { toast } from 'sonner';

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
  const queryClient = useQueryClient();
  
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        assigneeId: task.assignee_id,
        assigneeName: task.assignee_name,
        assigneeAvatar: task.assignee_avatar,
        status: task.status as 'todo' | 'in_progress' | 'blocked' | 'completed',
        priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
        dueDate: task.due_date,
        createdAt: task.created_at,
        completedAt: task.completed_at,
        tags: task.tags || [],
        subtasks: (task.subtasks as Array<{id: string; title: string; completed: boolean}>) || undefined
      }));
    }
  });
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

  const addTask = useMutation({
    mutationFn: async (task: Omit<Task, 'id' | 'createdAt'>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: task.title,
          description: task.description,
          assignee_id: task.assigneeId,
          assignee_name: task.assigneeName,
          assignee_avatar: task.assigneeAvatar,
          status: task.status,
          priority: task.priority,
          due_date: task.dueDate,
          completed_at: task.completedAt,
          tags: task.tags,
          subtasks: task.subtasks
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created');
    },
    onError: () => {
      toast.error('Failed to create task');
    }
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const { data, error} = await supabase
        .from('tasks')
        .update({
          title: updates.title,
          description: updates.description,
          assignee_id: updates.assigneeId,
          assignee_name: updates.assigneeName,
          assignee_avatar: updates.assigneeAvatar,
          status: updates.status,
          priority: updates.priority,
          due_date: updates.dueDate,
          completed_at: updates.completedAt,
          tags: updates.tags,
          subtasks: updates.subtasks
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated');
    },
    onError: () => {
      toast.error('Failed to update task');
    }
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted');
    },
    onError: () => {
      toast.error('Failed to delete task');
    }
  });

  const toggleTaskComplete = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const isCompleting = task.status !== 'completed';
      updateTask.mutate({
        id,
        updates: {
          status: isCompleting ? 'completed' : 'in_progress',
          completedAt: isCompleting ? new Date().toISOString() : undefined
        }
      });
    }
  };

  return {
    tasks: filteredTasks,
    isLoading,
    stats,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    addTask: addTask.mutate,
    updateTask: (id: string, updates: Partial<Task>) => updateTask.mutate({ id, updates }),
    deleteTask: deleteTask.mutate,
    toggleTaskComplete,
  };
};
