// 'use server';

/**
 * @fileOverview This file defines a Genkit flow for automatically suggesting categories for tasks
 * based on their title and description.
 *
 * - categorizeTask - A function that accepts a task title and description and returns suggested categories.
 * - CategorizeTaskInput - The input type for the categorizeTask function.
 * - CategorizeTaskOutput - The return type for the categorizeTask function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const CategorizeTaskInputSchema = z.object({
  title: z.string().describe('The title of the task.'),
  description: z.string().describe('A detailed description of the task.'),
});
export type CategorizeTaskInput = z.infer<typeof CategorizeTaskInputSchema>;

const CategorizeTaskOutputSchema = z.object({
  categories: z.array(z.string()).describe('An array of suggested categories for the task.'),
});
export type CategorizeTaskOutput = z.infer<typeof CategorizeTaskOutputSchema>;

export async function categorizeTask(input: CategorizeTaskInput): Promise<CategorizeTaskOutput> {
  return categorizeTaskFlow(input);
}

const categorizeTaskPrompt = ai.definePrompt({
  name: 'categorizeTaskPrompt',
  input: {schema: CategorizeTaskInputSchema},
  output: {schema: CategorizeTaskOutputSchema},
  prompt: `You are a helpful assistant that suggests categories for tasks.

  Given the following task title and description, suggest a few relevant categories.

  Title: {{{title}}}
  Description: {{{description}}}

  Categories:`, // Output should be comma separated list of categories.
});

const categorizeTaskFlow = ai.defineFlow(
  {
    name: 'categorizeTaskFlow',
    inputSchema: CategorizeTaskInputSchema,
    outputSchema: CategorizeTaskOutputSchema,
  },
  async input => {
    const {output} = await categorizeTaskPrompt(input);
    return output!;
  }
);
