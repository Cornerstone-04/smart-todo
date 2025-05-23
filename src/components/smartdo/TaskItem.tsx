"use client";

import type { Task } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertTriangle, Bell, CalendarDays, Edit3, MoreVertical, Trash2, BellPlus, CheckCircle2, Circle } from "lucide-react";
import { useTasks } from "./TaskProvider";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { CategoryPill } from "./CategoryPill";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import { SmartReminderDialog } from "./SmartReminderDialog";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils"; // assuming cn is your classnames utility

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { deleteTask, toggleTaskCompletion } = useTasks();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();

  return (
    <>
      <Card className={cn(
        "transition-all duration-300 ease-in-out",
        task.completed ? "bg-card/60 opacity-70" : "bg-card shadow-md hover:shadow-lg",
        isOverdue && !task.completed ? "border-destructive/50 ring-2 ring-destructive/30" : ""
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={() => toggleTaskCompletion(task.id)}
                aria-label={task.completed ? "Mark task as incomplete" : "Mark task as complete"}
                className="mt-1 shrink-0"
              />
              <div className="flex-grow">
                <CardTitle className={cn("text-lg leading-tight", task.completed && "line-through text-muted-foreground")}>
                  {task.title}
                </CardTitle>
                {task.description && (
                  <CardDescription className={cn("text-sm mt-1", task.completed && "line-through")}>
                    {task.description}
                  </CardDescription>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreVertical className="h-5 w-5" />
                  <span className="sr-only">Task options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsEditDialogOpen(true); }}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <SmartReminderDialog task={task}>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    {task.reminderDateTime ? (
                      <Bell className="mr-2 h-4 w-4 text-accent" />
                    ) : (
                      <BellPlus className="mr-2 h-4 w-4" />
                    )}
                    <span>{task.reminderDateTime ? "View/Edit Reminder" : "Smart Reminder"}</span>
                  </DropdownMenuItem>
                </SmartReminderDialog>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the task "{task.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteTask(task.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Task
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pb-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <CategoryPill category={task.category} />
            {task.completed ? (
              <div className="flex items-center text-green-600 dark:text-green-500">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Completed
              </div>
            ) : task.dueDate ? (
              <div className={cn("flex items-center", isOverdue && "text-destructive font-semibold")}>
                {isOverdue ? (
                  <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <CalendarDays className="h-3.5 w-3.5 mr-1" />
                )}
                <span>
                  {isOverdue
                    ? `Overdue by ${formatDistanceToNow(parseISO(task.dueDate), { addSuffix: false })}`
                    : `Due ${format(parseISO(task.dueDate), "MMM d, yyyy")}`}
                </span>
              </div>
            ) : (
              <div className="flex items-center">
                <Circle className="h-3.5 w-3.5 mr-1" /> Pending
              </div>
            )}
          </div>
          {task.reminderDateTime && !task.completed && (
            <div className="text-xs text-accent-foreground/80 bg-accent/10 p-2 rounded-md flex items-center">
              <Bell className="h-3.5 w-3.5 mr-1.5 shrink-0" />
              <span>Smart Reminder: {format(parseISO(task.reminderDateTime), "MMM d, yyyy 'at' h:mm a")}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog outside Card to avoid nesting issues */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Make changes to your task below.</DialogDescription>
          </DialogHeader>
          <TaskForm task={task} onOpenChange={setIsEditDialogOpen} />
        </DialogContent>
      </Dialog>
    </>
  );
}
