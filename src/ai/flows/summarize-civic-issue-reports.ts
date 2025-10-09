'use server';

/**
 * @fileOverview Summarizes civic issue reports for authorities.
 *
 * - summarizeCivicIssues - A function that summarizes civic issues based on provided reports and location.
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
    })
  ).describe('An array of civic issue reports.'),
  areaDescription: z.string().describe('A description of the area to summarize issues for.'),
});
export type SummarizeCivicIssuesInput = z.infer<typeof SummarizeCivicIssuesInputSchema>;

const SummarizeCivicIssuesOutputSchema = z.object({
  summary: z.string().describe('A summary of the civic issues in the specified area, highlighting common complaints and high-severity issues.'),
});
export type SummarizeCivicIssuesOutput = z.infer<typeof SummarizeCivicIssuesOutputSchema>;

export async function summarizeCivicIssues(input: SummarizeCivicIssuesInput): Promise<SummarizeCivicIssuesOutput> {
  return summarizeCivicIssuesFlow(input);
}

const summarizeCivicIssuesPrompt = ai.definePrompt({
  name: 'summarizeCivicIssuesPrompt',
  input: {schema: SummarizeCivicIssuesInputSchema},
  output: {schema: SummarizeCivicIssuesOutputSchema},
  prompt: `You are a civic analyst summarizing reports for city authorities.

  You will receive a list of civic issue reports and a description of an area.
  Your goal is to provide a concise summary of the reports, highlighting common issues, high-severity problems, and any notable trends in the specified area.

  Area Description: {{{areaDescription}}}

  Reports:
  {{#each reports}}
  - Issue Type: {{{issueType}}}, Severity: {{{severity}}}, Description: {{{aiDescription}}}, Location: Lat: {{{location.lat}}}, Lng: {{{location.lng}}}
  {{/each}}
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
