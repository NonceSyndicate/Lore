import { agentCoordinator } from './functions/agent-coordinator';
import { operatorHealthCheck, operatorMonitorTasks } from './functions/operator-functions';
import { researcherMarketAnalysis, researcherGithubAnalysis } from './functions/researcher-functions';
import { scribeDocumentUpdate, scribeLogSummary } from './functions/scribe-functions';

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
  scribeLogSummary
    // SIGNER orchestrator
  signerOrchestrator,
];

export { inngest } from './client';
