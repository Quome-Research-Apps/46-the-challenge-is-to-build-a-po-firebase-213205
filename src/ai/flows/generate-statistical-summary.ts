'use server';

/**
 * @fileOverview A flow for generating a statistical summary of real estate data.
 *
 * - generateStatisticalSummary - A function that generates a statistical summary of real estate data.
 * - GenerateStatisticalSummaryInput - The input type for the generateStatisticalSummary function.
 * - GenerateStatisticalSummaryOutput - The return type for the generateStatisticalSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStatisticalSummaryInputSchema = z.object({
  csvData: z.string().describe('A string containing the real estate data in CSV format.'),
});
export type GenerateStatisticalSummaryInput = z.infer<typeof GenerateStatisticalSummaryInputSchema>;

const GenerateStatisticalSummaryOutputSchema = z.object({
  summary: z.string().describe('A statistical summary of the real estate data, including mean, median, and standard deviation for key variables, and an LLM reasoning about the relevance of this data.'),
});
export type GenerateStatisticalSummaryOutput = z.infer<typeof GenerateStatisticalSummaryOutputSchema>;

export async function generateStatisticalSummary(input: GenerateStatisticalSummaryInput): Promise<GenerateStatisticalSummaryOutput> {
  return generateStatisticalSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStatisticalSummaryPrompt',
  input: {schema: GenerateStatisticalSummaryInputSchema},
  output: {schema: GenerateStatisticalSummaryOutputSchema},
  prompt: `You are an expert real estate data analyst. You are provided with real estate sales data in CSV format. Your task is to generate a statistical summary of the data, including the mean, median, and standard deviation for key variables such as sales price and price per square foot. Also, reason with the LLM regarding relevance of data.

CSV Data: {{{csvData}}}`,
});

const generateStatisticalSummaryFlow = ai.defineFlow(
  {
    name: 'generateStatisticalSummaryFlow',
    inputSchema: GenerateStatisticalSummaryInputSchema,
    outputSchema: GenerateStatisticalSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
