// IMPORTANT: This file is PROHIBITED from modifying any files in the src/ai/ directory.
// Filepath: src/app/actions.ts
"use server";

import { categorizeTask as categorizeTaskFlow, type CategorizeTaskInput } from "@/ai/flows/categorize-task";
import { scheduleReminder as scheduleReminderFlow, type ScheduleReminderInput } from "@/ai/flows/schedule-reminder";
import type { Task } from "@/lib/types";
import { z } from "zod";

const CategorizeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

export async function getTaskCategorySuggestion(values: z.infer<typeof CategorizeSchema>): Promise<{ category?: string; error?: string }> {
  const validatedFields = CategorizeSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid input for categorization." };
  }

  try {
    const input: CategorizeTaskInput = {
      title: validatedFields.data.title,
      description: validatedFields.data.description || "",
    };
    const result = await categorizeTaskFlow(input);
    if (result.categories && result.categories.length > 0) {
      return { category: result.categories[0] }; // Return the first suggested category
    }
    return { category: "General" }; // Default category if AI provides none
  } catch (e) {
    console.error("Error getting category suggestion:", e);
    return { error: "Failed to get category suggestion from AI." };
  }
}

const SmartReminderSchema = z.object({
  taskId: z.string(), // Not used by AI flow but good for context
  taskTitle: z.string().min(1),
  taskDescription: z.string().optional(),
  taskDueDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid due date" }),
  userHabits: z.string().min(1, "User habits are required for smart reminders."), // Example, could be fetched or configured
  taskUrgency: z.enum(["low", "medium", "high"]),
});

export async function getSmartReminderSuggestion(values: z.infer<typeof SmartReminderSchema>): Promise<{ reminderDateTime?: string; reasoning?: string; error?: string }> {
  const validatedFields = SmartReminderSchema.safeParse(values);
  if (!validatedFields.success) {
    // Construct a detailed error message from Zod issues
    const errorMessages = validatedFields.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
    return { error: `Invalid input for smart reminder: ${errorMessages}` };
  }
  
  try {
    const input: ScheduleReminderInput = {
      taskTitle: validatedFields.data.taskTitle,
      taskDescription: validatedFields.data.taskDescription || "",
      taskDueDate: validatedFields.data.taskDueDate,
      userHabits: validatedFields.data.userHabits,
      taskUrgency: validatedFields.data.taskUrgency,
    };
    const result = await scheduleReminderFlow(input);
    return { reminderDateTime: result.reminderDateTime, reasoning: result.reasoning };
  } catch (e) {
    console.error("Error getting smart reminder suggestion:", e);
    return { error: "Failed to get smart reminder suggestion from AI." };
  }
}
