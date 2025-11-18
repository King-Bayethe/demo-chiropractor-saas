import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Task } from "@/utils/mockData/mockTasks";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  task?: Task | null;
}

export const CreateTaskDialog = ({ isOpen, onClose, onSave, task }: CreateTaskDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('user1');
  const [assigneeName, setAssigneeName] = useState('Dr. Sarah Johnson');
  const [status, setStatus] = useState<Task['status']>('todo');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form if editing
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setAssigneeId(task.assigneeId);
      setAssigneeName(task.assigneeName);
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(new Date(task.dueDate));
      setTags(task.tags);
    } else {
      // Reset form for new task
      setTitle('');
      setDescription('');
      setAssigneeId('user1');
      setAssigneeName('Dr. Sarah Johnson');
      setStatus('todo');
      setPriority('medium');
      setDueDate(new Date());
      setTags([]);
    }
  }, [task, isOpen]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    if (!assigneeId) {
      toast.error("Please select an assignee");
      return;
    }

    setIsSubmitting(true);
    try {
      const taskData: Omit<Task, 'id' | 'createdAt'> = {
        title: title.trim(),
        description: description.trim(),
        assigneeId: assigneeId,
        assigneeName: assigneeName,
        status,
        priority,
        dueDate: dueDate.toISOString(),
        tags,
        completedAt: status === 'completed' ? new Date().toISOString() : undefined,
      };

      await onSave(taskData);
      toast.success("Task saved successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to save task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const assigneeOptions = [
    { id: 'user1', name: 'Dr. Sarah Johnson' },
    { id: 'user2', name: 'Dr. Michael Chen' },
    { id: 'user3', name: 'Lisa Martinez' },
    { id: 'user4', name: 'James Wilson' },
  ];

  const handleAssigneeChange = (id: string) => {
    const assignee = assigneeOptions.find(a => a.id === id);
    if (assignee) {
      setAssigneeId(id);
      setAssigneeName(assignee.name);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              placeholder="Enter task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Assignee and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee *</Label>
              <Select value={assigneeId} onValueChange={handleAssigneeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assigneeOptions.map((assignee) => (
                    <SelectItem key={assignee.id} value={assignee.id}>
                      {assignee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Task['status'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Priority and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Task['priority'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => date && setDueDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-primary/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting || !title.trim()}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
