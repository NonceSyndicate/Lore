import { serve } from 'inngest/next';
import { inngest } from '@/src/inngest/client';
import { functions } from '@/src/inngest';
import { signerOrchestrator } from '@/src/inngest/functions/signer-orchestrator';
/**
 * Inngest API Route Handler
 * Serves the Inngest event ingestion and function execution endpoints
 * Compatible with Next.js App Router and Vercel deployment
 */

export const { GET, POST, PUT } = serve({  client: inngest,
  ...functions, signerOrchestrator,
});
