import { serve } from 'inngest/next';
import { inngest } from './client';
import { agentCoordinator } from './functions/agent-coordinator';

// Export all Inngest functions
export const functions = [
  agentCoordinator,
];

// Create the Inngest serve handler for Next.js API routes or serverless
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});

// For standalone deployment
export { inngest } from './client';
