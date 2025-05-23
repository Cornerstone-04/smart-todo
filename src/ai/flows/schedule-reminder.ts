// src/ai/flows/schedule-reminder.ts
'use server';
/**
 * @fileOverview Flow to schedule a smart reminder for a task based on user habits and task urgency.
 *
 * - scheduleReminder - A function that schedules a smart reminder for a task.
 * - ScheduleReminderInput - The input type for the scheduleReminder function.
 * - ScheduleReminderOutput - The return type for the scheduleReminder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScheduleReminderInputSchema = z.object({
  taskTitle: z.string().describe('The title of the task.'),
  taskDescription: z.string().describe('A detailed description of the task.'),
  taskDueDate: z.string().describe('The due date of the task in ISO format.'),
  userHabits: z.string().describe('Description of user habits and daily schedule.'),
  taskUrgency: z.enum(['low', 'medium', 'high']).describe('The urgency level of the task.'),
});
export type ScheduleReminderInput = z.infer<typeof ScheduleReminderInputSchema>;

const ScheduleReminderOutputSchema = z.object({
  reminderDateTime: z.string().describe('The suggested date and time for the reminder in ISO format.'),
  reasoning: z.string().describe('The reasoning behind the suggested reminder time.'),
});
export type ScheduleReminderOutput = z.infer<typeof ScheduleReminderOutputSchema>;

export async function scheduleReminder(input: ScheduleReminderInput): Promise<ScheduleReminderOutput> {
  return scheduleReminderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scheduleReminderPrompt',
  input: {schema: ScheduleReminderInputSchema},
  output: {schema: ScheduleReminderOutputSchema},
  prompt: `You are an AI assistant that intelligently schedules reminders for tasks.

  Given the following information about the task, the user's habits, and the task's urgency, determine the optimal time to send a reminder.
  Consider the user's habits to suggest a time that is convenient and effective.
  Take into account the urgency of the task to ensure it is completed on time.

  Task Title: {{{taskTitle}}}
  Task Description: {{{taskDescription}}}
  Task Due Date: {{{taskDueDate}}}
  User Habits: {{{userHabits}}}
  Task Urgency: {{{taskUrgency}}}

  Reason your suggestion step by step, then provide the suggested reminder date and time in ISO format and the reasoning behind it.
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
});

const scheduleReminderFlow = ai.defineFlow(
  {
    name: 'scheduleReminderFlow',
    inputSchema: ScheduleReminderInputSchema,
    outputSchema: ScheduleReminderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
