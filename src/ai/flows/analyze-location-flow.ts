'use server';
/**
 * @fileOverview Analyzes GPS coordinates to generate a human-readable location name and descriptive keywords.
 *
 * - analyzeLocation - A function that performs reverse geocoding and generates location context keywords.
 * - AnalyzeLocationInput - The input type for the function.
 * - AnalyzeLocationOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeLocationInputSchema = z.object({
  location: z
    .object({
      lat: z.number().describe('The latitude of the issue.'),
      lng: z.number().describe('The longitude of the issue.'),
    })
    .describe('The GPS coordinates of the issue.'),
});
export type AnalyzeLocationInput = z.infer<typeof AnalyzeLocationInputSchema>;

const AnalyzeLocationOutputSchema = z.object({
  locationName: z.string().describe('A human-readable name for the location (e.g., street address, landmark).'),
  locationFingerprintKeywords: z.array(z.string()).describe('An array of 3-5 keywords describing the location context (e.g., street names, nearby landmarks, neighborhood).'),
});
export type AnalyzeLocationOutput = z.infer<typeof AnalyzeLocationOutputSchema>;

export async function analyzeLocation(
  input: AnalyzeLocationInput
): Promise<AnalyzeLocationOutput> {
  return analyzeLocationFlow(input);
}

const locationAnalysisPrompt = ai.definePrompt({
  name: 'locationAnalysisPrompt',
  input: { schema: AnalyzeLocationInputSchema },
  output: { schema: AnalyzeLocationOutputSchema },
  prompt: `You are an expert reverse geocoder. Your task is to provide a precise and accurate location name based on GPS coordinates.

  Given the following GPS coordinates:
  Latitude: {{{location.lat}}}
  Longitude: {{{location.lng}}}

  1.  Provide the most accurate and concise human-readable name for this location. Prioritize street addresses or specific intersections. Be as precise as possible.
  2.  Generate a "location fingerprint" consisting of 3-5 keywords that describe the location's context. Focus on permanent features like street names, intersections, landmarks, or neighborhood names. This fingerprint will be used to find similar locations.

  Example Output Format:
  {
    "locationName": "123 Main St, Anytown, USA",
    "locationFingerprintKeywords": ["main street", "anytown", "downtown", "intersection"]
  }
  `,
});

const analyzeLocationFlow = ai.defineFlow(
  {
    name: 'analyzeLocationFlow',
    inputSchema: AnalyzeLocationInputSchema,
    outputSchema: AnalyzeLocationOutputSchema,
  },
  async input => {
    const { output } = await locationAnalysisPrompt(input);
    return output!;
  }
);
