"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Sparkles, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { useTasks } from "./TaskProvider";
import type { Task, TaskUrgency } from "@/lib/types";
import { getTaskCategorySuggestion } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const taskFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  category: z.string().min(1, { message: "Category is required." }),
  urgency: z.enum(["low", "medium", "high"]),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  task?: Task;
  onOpenChange?: (open: boolean) => void; // To close dialog on submit
}

export function TaskForm({ task, onOpenChange }: TaskFormProps) {
  const { addTask, editTask, categories: existingCategories } = useTasks();
  const { toast } = useToast();
  const [isSuggestingCategory, setIsSuggestingCategory] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState<string | undefined>(undefined);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      dueDate: task?.dueDate ? parseISO(task.dueDate) : undefined,
      category: task?.category || "General",
      urgency: task?.urgency || "medium",
    },
  });

  const titleValue = form.watch("title");
  const descriptionValue = form.watch("description");

  const handleSuggestCategory = useCallback(async () => {
    if (!titleValue && !descriptionValue) {
      toast({ title: "Cannot suggest category", description: "Please enter a title or description.", variant: "destructive" });
      return;
    }
    setIsSuggestingCategory(true);
    try {
      const result = await getTaskCategorySuggestion({ title: titleValue, description: descriptionValue });
      if (result.error) {
        toast({ title: "Category Suggestion Failed", description: result.error, variant: "destructive" });
      } else if (result.category) {
        form.setValue("category", result.category);
        setSuggestedCategory(result.category);
        toast({ title: "Category Suggested!", description: `Set to "${result.category}". You can change it if needed.` });
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not get category suggestion.", variant: "destructive" });
    } finally {
      setIsSuggestingCategory(false);
    }
  }, [titleValue, descriptionValue, form, toast]);
  
  // Auto-suggest category when component mounts with existing task data or title/desc changes
  useEffect(() => {
    if (task && task.title && !form.getValues("category")) { // Only if category is not already set
      handleSuggestCategory();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount for existing task

  function onSubmit(data: TaskFormValues) {
    const taskData = {
      ...data,
      dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
    };

    if (task) {
      editTask(task.id, taskData);
      toast({ title: "Task Updated", description: `"${data.title}" has been updated.` });
    } else {
      addTask(taskData);
      toast({ title: "Task Created", description: `"${data.title}" has been added.` });
    }
    form.reset();
    if (onOpenChange) onOpenChange(false); // Close dialog
  }

  const uniqueCategories = Array.from(new Set([...existingCategories, suggestedCategory, "General", "Personal", "Work", "Shopping", "Urgent"].filter(Boolean) as string[]));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Buy groceries" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g. Milk, bread, cheese, and eggs"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } // Disable past dates
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="urgency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Urgency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Set task urgency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                   <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <Button type="button" variant="outline" size="icon" onClick={handleSuggestCategory} disabled={isSuggestingCategory} aria-label="Suggest Category">
                  {isSuggestingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                </Button>
              </div>
              <FormDescription>
                Select or type a category. Use the magic wand for an AI suggestion!
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full sm:w-auto">
          {task ? "Save Changes" : "Add Task"}
        </Button>
      </form>
    </Form>
  );
}
