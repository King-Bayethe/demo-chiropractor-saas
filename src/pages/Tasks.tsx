import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { TaskStatsCards } from "@/components/tasks/TaskStatsCards";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TasksTable } from "@/components/tasks/TasksTable";
import { TaskViewDialog } from "@/components/tasks/TaskViewDialog";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { Task } from "@/utils/mockData/mockTasks";
import { useState } from "react";
import { toast } from "sonner";

const Tasks = () => {
  const { 
    tasks, 
    stats, 
    filters, 
    setFilters, 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleTaskComplete 
  } = useTasks();
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    addTask(taskData);
    toast.success('Task created successfully');
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(null);
    setEditingTask(task);
    setIsCreateDialogOpen(true);
  };

  const handleUpdateTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      toast.success('Task updated successfully');
      setEditingTask(null);
    }
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    toast.success('Task deleted successfully');
  };

  const handleToggleComplete = (id: string) => {
    toggleTaskComplete(id);
    const task = tasks.find(t => t.id === id);
    if (task) {
      toast.success(task.status === 'completed' ? 'Task reopened' : 'Task completed');
    }
  };

  return (
    <Layout>
      <div className="h-full flex flex-col overflow-hidden">
        {/* Hero Header */}
        <div className="flex-shrink-0 bg-gradient-to-br from-muted/30 via-background to-muted/20 p-4 md:p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Task Management</h1>
              <p className="text-lg text-muted-foreground mt-1">
                Assign and track clinical and administrative tasks
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="hidden md:flex">
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex-shrink-0 p-4 md:p-6">
          <TaskStatsCards stats={stats} />
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-auto p-4 md:p-6 space-y-6">
          {/* Filters */}
          <TaskFilters filters={filters} onFilterChange={setFilters} />

          {/* Tasks Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    All Tasks ({tasks.length})
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage and track your team's tasks
                  </p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="md:hidden">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <TasksTable
                tasks={tasks}
                onViewTask={setSelectedTask}
                onEditTask={handleEditTask}
                onToggleComplete={handleToggleComplete}
                onDeleteTask={handleDeleteTask}
              />
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        <TaskViewDialog
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
        />
        <CreateTaskDialog
          isOpen={isCreateDialogOpen}
          onClose={() => {
            setIsCreateDialogOpen(false);
            setEditingTask(null);
          }}
          onSave={editingTask ? handleUpdateTask : handleCreateTask}
          task={editingTask}
        />
      </div>
    </Layout>
  );
};

export default Tasks;
