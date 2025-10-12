'use server';

/**
 * @fileOverview Summarizes civic issue reports for authorities.
 *
 * - summarizeCivicIssues - A function that summarizes civic issues based on provided reports and a user query.
 * - SummarizeCivicIssuesInput - The input type for the summarizeCivicIssues function.
 * - SummarizeCivicIssuesOutput - The return type for the summarizeCivicIssues function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCivicIssuesInputSchema = z.object({
  reports: z.array(
    z.object({
      issueType: z.string(),
      severity: z.string(),
      aiDescription: z.string(),
      location: z.object({
        lat: z.number(),
        lng: z.number(),
      }),
      status: z.string(),
      createdAt: z.string(),
    })
  ).describe('An array of civic issue reports.'),
  query: z.string().describe('The user\'s question or prompt about the reports.'),
});
export type SummarizeCivicIssuesInput = z.infer<typeof SummarizeCivicIssuesInputSchema>;

const SummarizeCivicIssuesOutputSchema = z.object({
  summary: z.string().describe('A summary of the civic issues based on the user query, highlighting common complaints, high-severity issues, or specific report details.'),
});
export type SummarizeCivicIssuesOutput = z.infer<typeof SummarizeCivicIssuesOutputSchema>;

export async function summarizeCivicIssues(input: SummarizeCivicIssuesInput): Promise<SummarizeCivicIssuesOutput> {
  return summarizeCivicIssuesFlow(input);
}

const summarizeCivicIssuesPrompt = ai.definePrompt({
  name: 'summarizeCivicIssuesPrompt',
  input: {schema: SummarizeCivicIssuesInputSchema},
  output: {schema: SummarizeCivicIssuesOutputSchema},
  prompt: `You are a helpful civic analyst AI. Your task is to answer questions and provide summaries based on a list of civic issue reports.

  Analyze the user's query and the provided report data to give a concise and accurate response.

  Current Date: ${new Date().toISOString()}

  User Query: {{{query}}}

  Report Data:
  {{#each reports}}
  - Issue Type: {{{issueType}}}, Severity: {{{severity}}}, Status: {{{status}}}, Description: {{{aiDescription}}}, Location: (Lat: {{{location.lat}}}, Lng: {{{location.lng}}}), Created: {{{createdAt}}}
  {{/each}}

  If the query is a greeting or not a question, respond politely. If asked for specific reports, list them clearly. If asked for a summary, provide a high-level overview.
  `,
});

const summarizeCivicIssuesFlow = ai.defineFlow(
  {
    name: 'summarizeCivicIssuesFlow',
    inputSchema: SummarizeCivicIssuesInputSchema,
    outputSchema: SummarizeCivicIssuesOutputSchema,
  },
  async input => {
    const {output} = await summarizeCivicIssuesPrompt(input);
    return output!;
  }
);
