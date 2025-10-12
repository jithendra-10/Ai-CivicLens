import { createApiHandler } from '@genkit-ai/next';
import '@/ai/flows/generate-civic-issue-report';
import '@/ai/flows/summarize-civic-issue-reports';
import '@/ai/flows/generate-image-fingerprint';

export const { GET, POST } = createApiHandler();
