'use server';
/**
 * @fileOverview Generates a human-readable location name from coordinates and an image.
 *
 * - generateLocationName - A function that creates a descriptive name for a location.
 * - GenerateLocationNameInput - The input type for the function.
 * - GenerateLocationNameOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateLocationNameInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the location, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  location: z
    .object({
      lat: z.number().describe('The latitude of the issue.'),
      lng: z.number().describe('The longitude of the issue.'),
    })
    .describe('The GPS coordinates of the issue.'),
});
export type GenerateLocationNameInput = z.infer<typeof GenerateLocationNameInputSchema>;

const GenerateLocationNameOutputSchema = z.object({
  locationName: z
    .string()
    .describe(
      'A human-readable name for the location based on the image and coordinates (e.g., "On the corner of Main St and 2nd Ave, near the red brick building").'
    ),
});
export type GenerateLocationNameOutput = z.infer<typeof GenerateLocationNameOutputSchema>;

export async function generateLocationName(
  input: GenerateLocationNameInput
): Promise<GenerateLocationNameOutput> {
  return generateLocationNameFlow(input);
}

const locationNamingPrompt = ai.definePrompt({
  name: 'locationNamingPrompt',
  input: { schema: GenerateLocationNameInputSchema },
  output: { schema: GenerateLocationNameOutputSchema },
  prompt: `You are an AI assistant that generates a human-readable location name based on GPS coordinates and an image.

  Analyze the image to identify landmarks, street signs, or other notable features. Use the GPS coordinates to provide context like street names if possible.

  Combine these to create a short, descriptive location name.

  Example: "On Maple Ave, in front of the public library."
  Example: "At the park entrance near the water fountain."
  Example: "Cracked sidewalk next to the blue apartment building."

  Location: Latitude: {{{location.lat}}}, Longitude: {{{location.lng}}}
  Image: {{media url=photoDataUri}}
  `,
});

const generateLocationNameFlow = ai.defineFlow(
  {
    name: 'generateLocationNameFlow',
    inputSchema: GenerateLocationNameInputSchema,
    outputSchema: GenerateLocationNameOutputSchema,
  },
  async input => {
    const { output } = await locationNamingPrompt(input);
    return output!;
  }
);
