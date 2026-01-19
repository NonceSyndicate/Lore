import { agentCoordinator } from './functions/agent-coordinator';
import { operatorHealthCheck, operatorMonitorTasks } from './functions/operator';
import { researcherMarketAnalysis, researcherGithubAnalysis } from './functions/researcher';
import { scribeDocumentUpdate, scribeLogSummary } from './functions/scribe';

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

export { inngest } from './client';