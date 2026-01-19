import { serve } from 'inngest/next';
import { inngest } from '@/src/inngest/client';
import { functions } from '@/src/inngest';

/**
 * Inngest API Route Handler
 * Serves the Inngest event ingestion and function execution endpoints
 * Compatible with Next.js App Router and Vercel deployment
 */

export default serve({  client: inngest,
  functions,
});
