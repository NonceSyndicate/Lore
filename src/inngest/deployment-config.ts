/**
 * Deployment Configuration and Utilities
 * Supports blue-green deployment and graceful shutdown
 */

export const DeploymentConfig = {
  // Get current deployment version from environment
  getVersion: (): string => {
    return process.env.DEPLOYMENT_VERSION || 'unknown';
  },

  // Check if we're in graceful shutdown mode
  isGracefulShutdown: (): boolean => {
    return process.env.GRACEFUL_SHUTDOWN === 'true';
  },

  // Log deployment status
  logStatus: (message: string, data?: Record<string, any>) => {
    const timestamp = new Date().toISOString();
    const version = DeploymentConfig.getVersion();
    console.log(
      `[${timestamp}] [DEPLOYMENT v${version}] ${message}`,
      data ? JSON.stringify(data) : ''
    );
  },

  // Handle graceful degradation
  handleDeploymentUnavailable: async (context: string) => {
    DeploymentConfig.logStatus(`Unavailable during ${context}`, {
      gracefulShutdown: DeploymentConfig.isGracefulShutdown(),
    });
    
    return {
      success: false,
      error: 'System is temporarily unavailable due to deployment. Please try again in a few moments.',
      retryAfter: '30 seconds',
      timestamp: new Date().toISOString(),
    };
  },
};

/**
 * Pre-flight checks for Inngest functions
 * Run at the start of each function handler
 */
export const inngestPreflightCheck = {
  validateEnvironment: () => {
    const errors: string[] = [];

    if (!process.env.SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      errors.push('SUPABASE_URL not configured');
    }

    if (!process.env.SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      errors.push('SUPABASE_ANON_KEY not configured');
    }

    if (!process.env.INNGEST_EVENT_KEY) {
      errors.push('INNGEST_EVENT_KEY not configured');
    }

    return {
      isHealthy: errors.length === 0,
      errors,
    };
  },

  shouldSkipTask: (): boolean => {
    return DeploymentConfig.isGracefulShutdown();
  },

  validateDatabase: async (supabase: any): Promise<boolean> => {
    if (!supabase) {
      console.error('[Preflight] Supabase client is null');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('agent_state')
        .select('id')
        .limit(1);

      if (error) {
        console.error('[Preflight] Database connection failed:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[Preflight] Database validation error:', err);
      return false;
    }
  },
};

/**
 * Task retry configuration
 * Balances quick recovery with system stability during deployments
 */
export const TaskRetryConfig = {
  // Exponential backoff for retries
  getRetryDelay: (attempt: number): number => {
    const baseDelay = 5; // seconds
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    const maxDelay = 300; // 5 minutes
    return Math.min(exponentialDelay + Math.random() * 5, maxDelay);
  },

  // Max attempts before giving up
  maxAttempts: 5,

  // Don't retry if it looks like a deployment issue
  isRetryable: (error: Error): boolean => {
    const message = error.message.toLowerCase();
    
    // Don't retry configuration errors (these need human intervention)
    if (message.includes('not initialized') || message.includes('not configured')) {
      return false;
    }

    // Retry database connection errors (likely temporary)
    if (message.includes('connection') || message.includes('timeout')) {
      return true;
    }

    // Default to retryable
    return true;
  },
};

/**
 * Health check endpoint for deployment monitoring
 * Call this from a health check endpoint in your Next.js app
 */
export const healthCheck = async (supabase: any) => {
  const checks = {
    deployment: {
      version: DeploymentConfig.getVersion(),
      gracefulShutdown: DeploymentConfig.isGracefulShutdown(),
    },
    environment: inngestPreflightCheck.validateEnvironment(),
    database: await inngestPreflightCheck.validateDatabase(supabase),
    timestamp: new Date().toISOString(),
  };

  const isHealthy = 
    checks.environment.isHealthy && 
    checks.database;

  return {
    status: isHealthy ? 'healthy' : 'degraded',
    checks,
  };
};
