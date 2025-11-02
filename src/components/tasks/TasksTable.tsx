import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, CheckCircle, Trash2 } from "lucide-react";
import { Task } from "@/utils/mockData/mockTasks";
import { format, isPast, isToday } from "date-fns";

interface TasksTableProps {
  tasks: Task[];
  onViewTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export const TasksTable = ({ tasks, onViewTask, onEditTask, onToggleComplete, onDeleteTask }: TasksTableProps) => {
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

    return (
      <Badge variant="outline" className={styles[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    const styles = {
      low: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700",
      medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700",
      high: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700",
      urgent: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700",
    };

    const labels = {
      low: "Low",
      medium: "Medium",
      high: "High",
      urgent: "Urgent",
    };

    return (
      <Badge variant="outline" className={styles[priority]}>
        {labels[priority]}
      </Badge>
    );
  };

  const getDueDateClass = (dueDate: string, status: Task['status']) => {
    if (status === 'completed') return 'text-muted-foreground';
    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date)) return 'text-red-600 dark:text-red-400 font-semibold';
    if (isToday(date)) return 'text-yellow-600 dark:text-yellow-400 font-semibold';
    return 'text-foreground';
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16">
        <CheckCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No tasks found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or create a new task to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase">Task</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase">Assignee</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase">Status</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase">Priority</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase">Due Date</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase">Tags</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow 
              key={task.id}
              className="hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onViewTask(task)}
            >
              <TableCell>
                <div>
                  <p className="font-medium text-foreground">{task.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {task.assigneeName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-foreground">{task.assigneeName}</span>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(task.status)}</TableCell>
              <TableCell>{getPriorityBadge(task.priority)}</TableCell>
              <TableCell>
                <span className={getDueDateClass(task.dueDate, task.status)}>
                  {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {task.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {task.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{task.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background border-border">
                    <DropdownMenuItem onClick={() => onViewTask(task)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditTask(task)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleComplete(task.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {task.status === 'completed' ? 'Reopen' : 'Mark Complete'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDeleteTask(task.id)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
