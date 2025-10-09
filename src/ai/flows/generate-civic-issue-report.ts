'use server';
/**
 * @fileOverview Generates a civic issue report based on an image.
 *
 * - generateCivicIssueReport - A function that generates the civic issue report.
 * - GenerateCivicIssueReportInput - The input type for the generateCivicIssueReport function.
 * - GenerateCivicIssueReportOutput - The return type for the generateCivicIssueReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCivicIssueReportInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the civic issue, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  location: z
    .object({
      lat: z.number().describe('The latitude of the issue.'),
      lng: z.number().describe('The longitude of the issue.'),
    })
    .describe('The GPS coordinates of the issue.'),
});
export type GenerateCivicIssueReportInput = z.infer<typeof GenerateCivicIssueReportInputSchema>;

const GenerateCivicIssueReportOutputSchema = z.object({
  issueType: z.string().describe('The type of civic issue (e.g., pothole, garbage).'),
  severity: z.string().describe('The severity of the issue (Low, Medium, High).'),
  aiDescription: z.string().describe('A description of the issue.'),
});
export type GenerateCivicIssueReportOutput = z.infer<typeof GenerateCivicIssueReportOutputSchema>;

export async function generateCivicIssueReport(
  input: GenerateCivicIssueReportInput
): Promise<GenerateCivicIssueReportOutput> {
  return generateCivicIssueReportFlow(input);
}

const civicIssueReportPrompt = ai.definePrompt({
  name: 'civicIssueReportPrompt',
  input: {schema: GenerateCivicIssueReportInputSchema},
  output: {schema: GenerateCivicIssueReportOutputSchema},
  prompt: `You are an AI assistant helping to generate civic issue reports.

  Analyze the image and provide the issue type, severity, and a short description.

  Location: Latitude: {{{location.lat}}}, Longitude: {{{location.lng}}}

  Image: {{media url=photoDataUri}}

  Respond in the following format:
  {
    "issueType": "",
    "severity": "",
    "aiDescription": ""
  }`,
});

const generateCivicIssueReportFlow = ai.defineFlow(
  {
    name: 'generateCivicIssueReportFlow',
    inputSchema: GenerateCivicIssueReportInputSchema,
    outputSchema: GenerateCivicIssueReportOutputSchema,
  },
  async input => {
    const {output} = await civicIssueReportPrompt(input);
    return output!;
  }
);
