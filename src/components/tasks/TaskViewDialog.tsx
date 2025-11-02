import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "@/utils/mockData/mockTasks";
import { format } from "date-fns";
import { Calendar, User, Clock, CheckCircle, Edit, Trash2, Tag } from "lucide-react";

interface TaskViewDialogProps {
  task: Task | null;
  onClose: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onToggleComplete?: (id: string) => void;
}

export const TaskViewDialog = ({ task, onClose, onEdit, onDelete, onToggleComplete }: TaskViewDialogProps) => {
  if (!task) return null;

  const getStatusBadge = (status: Task['status']) => {
    const styles = {
      todo: "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700",
      in_progress: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700",
      blocked: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700",
      completed: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700",
    };
    const labels = {
      todo: "To Do",
      in_progress: "In Progress",
      blocked: "Blocked",
      completed: "Completed",
    };
    return <Badge variant="outline" className={styles[status]}>{labels[status]}</Badge>;
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    const styles = {
      low: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700",
      medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700",
      high: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700",
      urgent: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700",
    };
    const labels = { low: "Low", medium: "Medium", high: "High", urgent: "Urgent" };
    return <Badge variant="outline" className={styles[priority]}>{labels[priority]}</Badge>;
  };

  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center gap-3">
            {getStatusBadge(task.status)}
            {getPriorityBadge(task.priority)}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.description}</p>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assignee */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">Assigned To</span>
              </div>
              <div className="flex items-center gap-2 ml-6">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {task.assigneeName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground">{task.assigneeName}</span>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Due Date</span>
              </div>
              <p className="text-sm text-foreground ml-6">
                {format(new Date(task.dueDate), 'MMMM dd, yyyy')}
              </p>
            </div>

            {/* Created Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Created</span>
              </div>
              <p className="text-sm text-foreground ml-6">
                {format(new Date(task.createdAt), 'MMMM dd, yyyy')}
              </p>
            </div>

            {/* Completed Date */}
            {task.completedAt && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
                <p className="text-sm text-foreground ml-6">
                  {format(new Date(task.completedAt), 'MMMM dd, yyyy')}
                </p>
              </div>
            )}
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span className="text-sm font-medium">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2 ml-6">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Subtasks</h3>
                <div className="space-y-2">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-3">
                      <Checkbox checked={subtask.completed} disabled />
                      <span className={`text-sm ${subtask.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <Separator />
          <div className="flex flex-wrap gap-2">
            {onEdit && (
              <Button onClick={() => onEdit(task)} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Task
              </Button>
            )}
            {onToggleComplete && (
              <Button onClick={() => onToggleComplete(task.id)} variant="outline">
                <CheckCircle className="h-4 w-4 mr-2" />
                {task.status === 'completed' ? 'Reopen Task' : 'Mark Complete'}
              </Button>
            )}
            {onDelete && (
              <Button 
                onClick={() => {
                  onDelete(task.id);
                  onClose();
                }} 
                variant="outline"
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Task
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
