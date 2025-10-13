import { createApiHandler } from '@genkit-ai/next';
import '@/ai/flows/generate-civic-issue-report';
import '@/ai/flows/summarize-civic-issue-reports';
import '@/ai/flows/generate-image-fingerprint';
import '@/ai/flows/send-status-update-notification';

export const { GET, POST } = createApiHandler();
