import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-civic-issue-reports.ts';
import '@/ai/flows/generate-civic-issue-report.ts';
import '@/ai/flows/generate-image-fingerprint.ts';
