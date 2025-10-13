'use server';
/**
 * @fileOverview Simulates sending a status update notification to a user.
 *
 * - sendStatusUpdateNotification - A function that simulates sending a notification.
 * - SendStatusUpdateNotificationInput - The input type for the function.
 * - SendStatusUpdateNotificationOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SendStatusUpdateNotificationInputSchema = z.object({
  recipientEmail: z.string().email().describe('The email address of the user to notify.'),
  reportId: z.string().describe('The ID of the report that was updated.'),
  newStatus: z.string().describe('The new status of the report.'),
  issueType: z.string().describe('The type of issue for the report.'),
});
export type SendStatusUpdateNotificationInput = z.infer<typeof SendStatusUpdateNotificationInputSchema>;

const SendStatusUpdateNotificationOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type SendStatusUpdateNotificationOutput = z.infer<typeof SendStatusUpdateNotificationOutputSchema>;

export async function sendStatusUpdateNotification(
  input: SendStatusUpdateNotificationInput
): Promise<SendStatusUpdateNotificationOutput> {
  return sendStatusUpdateNotificationFlow(input);
}

// This flow simulates sending an email. In a real application, this would
// integrate with an email service like SendGrid or AWS SES.
const sendStatusUpdateNotificationFlow = ai.defineFlow(
  {
    name: 'sendStatusUpdateNotificationFlow',
    inputSchema: SendStatusUpdateNotificationInputSchema,
    outputSchema: SendStatusUpdateNotificationOutputSchema,
  },
  async (input) => {
    console.log('**************************************************');
    console.log('SIMULATING SENDING EMAIL NOTIFICATION');
    console.log('Recipient:', input.recipientEmail);
    console.log('Report ID:', input.reportId);
    console.log('Issue Type:', input.issueType);
    console.log('New Status:', input.newStatus);
    console.log(
      `Message: "Hello, this is a notification that your report regarding '${input.issueType}' (ID: ${input.reportId}) has been updated to '${input.newStatus}'."`
    );
    console.log('**************************************************');

    // In a real app, you would have error handling for the email service.
    // For this simulation, we will always assume success.
    return {
      success: true,
      message: `Simulated notification sent to ${input.recipientEmail} for report ${input.reportId}.`,
    };
  }
);
