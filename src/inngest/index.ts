import { serve } from 'inngest/next';
import { inngest } from './client';
import { agentCoordinator } from './functions/agent-coordinator';
import { operatorHealthCheck, operatorMonitorTasks } from './functions/operator-functions';
import { researcherMarketAnalysis, researcherGithubAnalysis } from './functions/researcher-functions';
import { scribeDocumentUpdate, scribeLogSummary } from './functions/scribe-functions';

// Export all Inngest functions
export const functions = [
  agentCoordinator,
  // OPERATOR agent functions
  operatorHealthCheck,
  operatorMonitorTasks,
  // RESEARCHER agent functions
  researcherMarketAnalysis,
  researcherGithubAnalysis,
  // SCRIBE agent functions
  scribeDocumentUpdate,
  scribeLogSummary,
];

// Create the Inngest serve handler for Next.js API routes or serverless
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});

// For standalone deployment
export { inngest } from './client';
