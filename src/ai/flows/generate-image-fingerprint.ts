'use server';
/**
 * @fileOverview Generates a descriptive fingerprint from an image for duplicate detection.
 *
 * - generateImageFingerprint - A function that creates a concise keyword-based fingerprint from an image.
 * - GenerateImageFingerprintInput - The input type for the function.
 * - GenerateImageFingerprintOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateImageFingerprintInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the civic issue, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateImageFingerprintInput = z.infer<typeof GenerateImageFingerprintInputSchema>;

const GenerateImageFingerprintOutputSchema = z.object({
  fingerprintKeywords: z.array(z.string()).describe('An array of 3-5 keywords describing the main subject and its context.'),
});
export type GenerateImageFingerprintOutput = z.infer<typeof GenerateImageFingerprintOutputSchema>;


export async function generateImageFingerprint(
  input: GenerateImageFingerprintInput
): Promise<GenerateImageFingerprintOutput> {
  return generateImageFingerprintFlow(input);
}

const fingerprintingPrompt = ai.definePrompt({
  name: 'fingerprintingPrompt',
  input: { schema: GenerateImageFingerprintInputSchema },
  output: { schema: GenerateImageFingerprintOutputSchema },
  prompt: `You are an AI assistant that creates a concise, descriptive 'fingerprint' for an image of a civic issue. 
  
  The fingerprint should be an array of 3-5 keywords describing the main subject and its immediate, distinct context. This will be used to find similar images in a database.
  
  Focus on the most permanent and objective features in the image. Avoid using colors or transient details.
  
  Example Output Format:
  {
    "fingerprintKeywords": ["pothole", "asphalt", "road", "crack"]
  }

  Image: {{media url=photoDataUri}}
  `,
});


const generateImageFingerprintFlow = ai.defineFlow(
  {
    name: 'generateImageFingerprintFlow',
    inputSchema: GenerateImageFingerprintInputSchema,
    outputSchema: GenerateImageFingerprintOutputSchema,
  },
  async input => {
    const { output } = await fingerprintingPrompt(input);
    return output!;
  }
);
