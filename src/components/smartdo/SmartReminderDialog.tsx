"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getSmartReminderSuggestion } from "@/app/actions";
import type { Task } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { Loader2, BellPlus } from "lucide-react";
import { useTasks } from "./TaskProvider";

interface SmartReminderDialogProps {
  task: Task;
  children: React.ReactNode; // For the trigger
}

export function SmartReminderDialog({ task, children }: SmartReminderDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userHabits, setUserHabits] = useState(
    typeof window !== "undefined" ? localStorage.getItem("smartdo-userHabits") || "Usually free in the evenings after 7 PM and on weekend mornings." : "Usually free in the evenings after 7 PM and on weekend mornings."
  );
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<{ dateTime?: string; reasoning?: string } | null>(null);
  const { toast } = useToast();
  const { setTaskReminder } = useTasks();

  const handleFetchSuggestion = async () => {
    if (!task.dueDate) {
      toast({
        title: "Due Date Required",
        description: "Please set a due date for the task to get a smart reminder suggestion.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSuggestion(null);
    try {
      const result = await getSmartReminderSuggestion({
        taskId: task.id,
        taskTitle: task.title,
        taskDescription: task.description,
        taskDueDate: task.dueDate,
        userHabits: userHabits,
        taskUrgency: task.urgency,
      });

      if (result.error) {
        toast({ title: "Suggestion Failed", description: result.error, variant: "destructive" });
      } else if (result.reminderDateTime && result.reasoning) {
        setSuggestion({ dateTime: result.reminderDateTime, reasoning: result.reasoning });
        toast({ title: "Suggestion Ready!", description: "Review the smart reminder suggestion below." });
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not get reminder suggestion.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReminder = () => {
    if (suggestion?.dateTime && suggestion.reasoning) {
      setTaskReminder(task.id, suggestion.dateTime, suggestion.reasoning);
      toast({ title: "Reminder Set!", description: `Smart reminder for "${task.title}" has been scheduled.` });
      localStorage.setItem("smartdo-userHabits", userHabits); // Save habits for next time
      setIsOpen(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSuggestion(null); // Reset suggestion when dialog closes
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Smart Reminder</DialogTitle>
          <DialogDescription>
            Let AI suggest the best time for a reminder for "{task.title}".
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="userHabits">Your General Habits/Schedule</Label>
            <Textarea
              id="userHabits"
              value={userHabits}
              onChange={(e) => setUserHabits(e.target.value)}
              placeholder="e.g., I'm usually busy from 9 AM to 5 PM on weekdays. I prefer reminders in the morning."
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">This helps in suggesting better reminder times.</p>
          </div>

          {task.dueDate && (
             <p className="text-sm">Task Due: <span className="font-semibold">{format(parseISO(task.dueDate), "PPP")}</span></p>
          )}
          <p className="text-sm">Urgency: <span className="font-semibold capitalize">{task.urgency}</span></p>

          <Button onClick={handleFetchSuggestion} disabled={isLoading || !task.dueDate} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BellPlus className="mr-2 h-4 w-4" />}
            Get Suggestion
          </Button>

          {suggestion && (
            <div className="mt-4 p-3 bg-muted rounded-md space-y-2">
              <h4 className="font-semibold text-foreground">Suggested Reminder:</h4>
              <p className="text-sm">
                <strong>Time:</strong> {format(parseISO(suggestion.dateTime!), "PPPp")}
              </p>
              <p className="text-sm">
                <strong>Reasoning:</strong> {suggestion.reasoning}
              </p>
            </div>
          )}
           {task.reminderDateTime && !suggestion && (
            <div className="mt-4 p-3 bg-accent/20 border border-accent/50 rounded-md space-y-2">
              <h4 className="font-semibold text-accent-foreground">Current Reminder:</h4>
              <p className="text-sm">
                <strong>Time:</strong> {format(parseISO(task.reminderDateTime), "PPPp")}
              </p>
              {task.reminderReasoning && <p className="text-sm">
                <strong>AI Reasoning:</strong> {task.reminderReasoning}
              </p>}
              <p className="text-xs text-muted-foreground">Get a new suggestion to update or change this reminder.</p>
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleConfirmReminder} disabled={!suggestion || isLoading}>
            Confirm Reminder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
