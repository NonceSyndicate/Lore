/**
 * Epic Missions Seed Script - 47 Autonomous Missions
 * The Nonce Syndicate's Complete Battle Plan
 * 
 * This script populates the mission system with comprehensive,
 * ambitious missions organized around 4 strategic pillars:
 * 1. Incredible Landing Page (Presale & Hype)
 * 2. Concurrent Agent Development (Autonomous Pipeline)
 * 3. Autonomous Twitter Bot (Community & Hype)
 * 4. Tools & Ecosystem (Platform Builder)
 * 
 * Usage: npx ts-node src/scripts/seed-epic-missions.ts
 */

import { createClient } from '@supabase/supabase-js';
import { Mission } from '../types/missions';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const epicMissions: Omit<Mission, 'id' | 'created_at'>[] = [
  // ==================== PILLAR 1: LANDING PAGE (8 missions) ====================

  {
    title: '🌐 CRITICAL: Design Presale Landing Page',
    description: 'Create a high-converting landing page with email capture, presale offer, and social proof',
    priority: 'critical',
    status: 'pending',
    assigned_to: 'signer',
    context: {
      objectives: [
        'Design beautiful, modern landing page',
        'Implement email capture form',
        'Add presale offer prominently',
        'Include social proof sections',
        'Mobile-first responsive design',
        'Fast load times (<2s)',
        'Clear CTA placement',
      ],
      tools_available: [
        'Next.js',
        'Tailwind CSS',
        'Vercel',
        'Figma',
        'Email service',
      ],
      budget_limit_usd: 500,
      autonomous: false,
    },
    tags: ['landing-page', 'critical', 'presale', 'marketing'],
    metadata: {
      category: 'marketing',
      milestone: 'phase-1',
      conversion_target: 0.05,
    },
  },

  {
    title: '📧 HIGH: Set Up Email Campaign Infrastructure',
    description: 'Configure email service, create templates, set up automation for presale funnel',
    priority: 'high',
    status: 'pending',
    assigned_to: 'scribe',
    context: {
      objectives: [
        'Choose email provider',
        'Set up email templates',
        'Create welcome sequence',
        'Build presale announcement template',
        'Configure automation triggers',
        'Set up segmentation',
        'Monitor deliverability',
      ],
      tools_available: [
        'Mailgun',
        'SendGrid',
        'Substack',
        'Supabase Auth',
      ],
      budget_limit_usd: 200,
      autonomous: true,
    },
    tags: ['email', 'marketing', 'automation'],
    metadata: {
      category: 'marketing',
      email_list_target: 5000,
    },
  },

  {
    title: '💰 HIGH: Create Presale Offer & Pricing Strategy',
    description: 'Define presale tiers, pricing, bonuses, and urgency mechanics',
    priority: 'high',
    status: 'pending',
    assigned_to: 'signer',
    context: {
      objectives: [
        'Define 3-5 presale tiers',
        'Set pricing for each tier',
        'Create bonus structure',
        'Design urgency mechanics',
        'Plan limited-time offers',
        'Create scarcity messaging',
        'Document terms & conditions',
      ],
      tools_available: [
        'Spreadsheet analysis',
        'Market research',
        'Competitor analysis',
      ],
      budget_limit_usd: 0,
      autonomous: false,
    },
    tags: ['presale', 'pricing', 'strategy'],
    metadata: {
      category: 'business',
      presale_target_usd: 50000,
    },
  },

  {
    title: '📊 HIGH: Implement Analytics & Tracking',
    description: 'Set up GA4, heatmaps, conversion tracking, and A/B testing',
    priority: 'high',
    status: 'pending',
    assigned_to: 'operator',
    context: {
      objectives: [
        'Set up Google Analytics 4',
        'Add heatmap tracking',
        'Implement conversion funnels',
        'Configure A/B testing',
        'Set up UTM tracking',
        'Create dashboards',
        'Monitor daily metrics',
      ],
      tools_available: [
        'Google Analytics',
        'Hotjar',
        'Mixpanel',
        'Custom tracking',
      ],
      budget_limit_usd: 50,
      autonomous: true,
    },
    tags: ['analytics', 'marketing', 'optimization'],
    metadata: {
      category: 'data',
      metric_update_frequency: 'hourly',
    },
  },

  {
    title: '⭐ MEDIUM: Create Social Proof & Testimonials',
    description: 'Gather testimonials, create case studies, and build credibility',
    priority: 'medium',
    status: 'pending',
    assigned_to: 'scribe',
    context: {
      objectives: [
        'Collect testimonials from early users',
        'Create case studies',
        'Add social proof elements',
        'Include metrics and results',
        'Add video testimonials',
        'Build trust badges',
        'Create comparison content',
      ],
      tools_available: [
        'Email outreach',
        'Video recording',
        'Testimonial platforms',
      ],
      budget_limit_usd: 100,
      autonomous: true,
    },
    tags: ['social-proof', 'credibility', 'marketing'],
    metadata: {
      category: 'marketing',
      testimonial_target: 10,
    },
  },

  {
    title: '⚡ MEDIUM: Optimize for SEO & Performance',
    description: 'Achieve Lighthouse score >95, Core Web Vitals, and SEO optimization',
    priority: 'medium',
    status: 'pending',
    assigned_to: 'operator',
    context: {
      objectives: [
        'Achieve Lighthouse score >95',
        'Optimize Core Web Vitals',
        'Improve SEO metadata',
        'Optimize images',
        'Minify CSS/JS',
        'Implement caching',
        'Monitor page speed',
      ],
      tools_available: [
        'Lighthouse',
        'PageSpeed Insights',
        'Vercel Analytics',
        'SEMrush',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['seo', 'performance', 'optimization'],
    metadata: {
      category: 'technical',
      lighthouse_target: 95,
    },
  },

  {
    title: '📢 MEDIUM: Set Up Multi-Channel Presale',
    description: 'Create presence across Landing page, Email, Twitter, Discord, Reddit',
    priority: 'medium',
    status: 'pending',
    assigned_to: 'scribe',
    context: {
      objectives: [
        'Create Discord server',
        'Set up Reddit community',
        'Launch Twitter presale campaign',
        'Create email drip campaign',
        'Build landing page funnel',
        'Coordinate messaging across channels',
        'Track channel performance',
      ],
      tools_available: [
        'Discord API',
        'Reddit API',
        'Twitter API',
        'Email service',
      ],
      budget_limit_usd: 150,
      autonomous: true,
    },
    tags: ['multi-channel', 'presale', 'marketing'],
    metadata: {
      category: 'marketing',
      channels: ['web', 'email', 'twitter', 'discord', 'reddit'],
    },
  },

  {
    title: '❓ LOW: Create Presale FAQ & Resources',
    description: 'Create FAQ, guides, how-to videos, and support documentation',
    priority: 'low',
    status: 'pending',
    assigned_to: 'scribe',
    context: {
      objectives: [
        'Write comprehensive FAQ',
        'Create presale guide',
        'Record how-to videos',
        'Build support docs',
        'Create troubleshooting guide',
        'Add payment instructions',
        'Document refund policy',
      ],
      tools_available: [
        'Documentation tools',
        'Video recording',
        'Knowledge base software',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['documentation', 'support', 'faq'],
    metadata: {
      category: 'support',
      faq_items_target: 50,
    },
  },

  // ==================== PILLAR 2: AGENT DEVELOPMENT (14 missions) ====================

  {
    title: '🌳 CRITICAL: Implement Feature Branch Strategy',
    description: 'Create branch naming convention, protection rules, auto-delete policy',
    priority: 'critical',
    status: 'pending',
    assigned_to: 'operator',
    context: {
      objectives: [
        'Define branch naming convention',
        'Set up branch protection rules',
        'Configure auto-delete old branches',
        'Create branch review process',
        'Document branch strategy',
        'Set up status checks',
        'Configure merge requirements',
      ],
      tools_available: [
        'GitHub API',
        'GitHub Actions',
        'Vercel',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['infrastructure', 'devops', 'critical'],
    metadata: {
      category: 'development',
      branch_strategy: 'git-flow',
    },
  },

  {
    title: '🔄 CRITICAL: Set Up CI/CD Auto-Merge Pipeline',
    description: 'GitHub Actions automation for auto-merge on tests passing, rollback capability',
    priority: 'critical',
    status: 'pending',
    assigned_to: 'operator',
    context: {
      objectives: [
        'Create GitHub Actions workflow',
        'Auto-merge on tests passing',
        'Implement rollback capability',
        'Add performance checks',
        'Create deployment logs',
        'Set up failure notifications',
        'Configure retry logic',
      ],
      tools_available: [
        'GitHub Actions',
        'Vercel',
        'Inngest',
        'Supabase',
      ],
      budget_limit_usd: 200,
      autonomous: true,
    },
    tags: ['ci-cd', 'devops', 'critical'],
    metadata: {
      category: 'development',
      deployment_frequency: 'hourly',
    },
  },

  {
    title: '🧪 HIGH: Implement Automated Testing Suite',
    description: 'Unit tests, integration tests, E2E tests with >80% coverage',
    priority: 'high',
    status: 'pending',
    assigned_to: 'operator',
    context: {
      objectives: [
        'Create unit test suite',
        'Build integration tests',
        'Implement E2E tests',
        'Achieve >80% coverage',
        'Set up test CI/CD',
        'Create test data fixtures',
        'Monitor test performance',
      ],
      tools_available: [
        'Jest',
        'Cypress',
        'Vitest',
        'Playwright',
      ],
      budget_limit_usd: 100,
      autonomous: true,
    },
    tags: ['testing', 'quality', 'devops'],
    metadata: {
      category: 'quality-assurance',
      coverage_target: 0.80,
    },
  },

  {
    title: '🤖 HIGH: Create Agent Code Generation Framework',
    description: 'Templates, scaffolding, validation, and documentation generation',
    priority: 'high',
    status: 'pending',
    assigned_to: 'signer',
    context: {
      objectives: [
        'Create scaffolding templates',
        'Build code generators',
        'Implement validation system',
        'Auto-generate documentation',
        'Create test templates',
        'Build type definitions',
        'Generate README files',
      ],
      tools_available: [
        'Plop',
        'Yeoman',
        'Custom Node scripts',
      ],
      budget_limit_usd: 0,
      autonomous: false,
    },
    tags: ['code-generation', 'automation', 'framework'],
    metadata: {
      category: 'development',
      template_types: ['agent', 'function', 'api'],
    },
  },

  {
    title: '🚨 HIGH: Build Deployment Monitoring & Rollback',
    description: 'Real-time monitoring, automatic rollback on errors, health checks',
    priority: 'high',
    status: 'pending',
    assigned_to: 'operator',
    context: {
      objectives: [
        'Implement real-time monitoring',
        'Create rollback automation',
        'Build health check system',
        'Set up error detection',
        'Create alert system',
        'Implement gradual rollout',
        'Monitor deployment metrics',
      ],
      tools_available: [
        'Vercel',
        'Inngest',
        'Sentry',
        'DataDog',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['monitoring', 'devops', 'reliability'],
    metadata: {
      category: 'operations',
      error_threshold: 0.05,
    },
  },

  {
    title: '📈 MEDIUM: Implement Agent Learning System',
    description: 'Track deployment results, analyze failures, improve next iteration',
    priority: 'medium',
    status: 'pending',
    assigned_to: 'researcher',
    context: {
      objectives: [
        'Track deployment metrics',
        'Analyze failure patterns',
        'Generate improvement suggestions',
        'Update agent prompts',
        'Refine templates',
        'Learn from successes',
        'Create feedback loop',
      ],
      tools_available: [
        'Supabase',
        'Analytics tools',
        'ML notebooks',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['machine-learning', 'optimization', 'ai'],
    metadata: {
      category: 'ai',
      learning_rate: 'dynamic',
    },
  },

  {
    title: '🔗 MEDIUM: Create Multi-Agent Coordination Protocol',
    description: 'Agent messaging, task handoff, dependency management',
    priority: 'medium',
    status: 'pending',
    assigned_to: 'operator',
    context: {
      objectives: [
        'Design messaging protocol',
        'Implement task handoff',
        'Create dependency tracking',
        'Build workflow engine',
        'Implement idempotency',
        'Create audit trail',
        'Handle failures',
      ],
      tools_available: [
        'Inngest',
        'Redis',
        'Message queues',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['coordination', 'architecture', 'scaling'],
    metadata: {
      category: 'infrastructure',
      max_agents: 100,
    },
  },

  {
    title: '💾 MEDIUM: Build Agent Resource Optimizer',
    description: 'Track compute usage, optimize allocation, cost optimization',
    priority: 'medium',
    status: 'pending',
    assigned_to: 'researcher',
    context: {
      objectives: [
        'Track resource usage',
        'Optimize allocation',
        'Reduce costs',
        'Monitor performance',
        'Create recommendations',
        'Auto-scale resources',
        'Generate cost reports',
      ],
      tools_available: [
        'Vercel Analytics',
        'CloudFlare',
        'Cost monitoring tools',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['optimization', 'cost', 'performance'],
    metadata: {
      category: 'operations',
      cost_target_usd_per_deployment: 0.50,
    },
  },

  {
    title: '⚖️ MEDIUM: Implement Agent Conflict Resolution',
    description: 'Handle competing tasks, priority resolution, fair scheduling',
    priority: 'medium',
    status: 'pending',
    assigned_to: 'operator',
    context: {
      objectives: [
        'Design conflict detection',
        'Implement priority resolution',
        'Create fair scheduling',
        'Build deadlock prevention',
        'Create conflict logs',
        'Handle edge cases',
        'Document resolution rules',
      ],
      tools_available: [
        'Scheduling algorithms',
        'Priority queues',
        'Inngest',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['scheduling', 'conflict-resolution', 'coordination'],
    metadata: {
      category: 'infrastructure',
      conflict_target: 0.0,
    },
  },

  {
    title: '📊 LOW: Create Agent Deployment Dashboard',
    description: 'Real-time deployment status, agent health, resource usage',
    priority: 'low',
    status: 'pending',
    assigned_to: 'scribe',
    context: {
      objectives: [
        'Build deployment dashboard',
        'Show agent status',
        'Display resource usage',
        'Show deployment history',
        'Create alerts panel',
        'Add performance charts',
        'Implement filtering',
      ],
      tools_available: [
        'React',
        'Vercel',
        'Supabase',
      ],
      budget_limit_usd: 100,
      autonomous: true,
    },
    tags: ['monitoring', 'visualization', 'ui'],
    metadata: {
      category: 'operations',
      refresh_rate_seconds: 5,
    },
  },

  {
    title: '📚 LOW: Document Agent Development Best Practices',
    description: 'Write guides, create templates, build team knowledge base',
    priority: 'low',
    status: 'pending',
    assigned_to: 'scribe',
    context: {
      objectives: [
        'Write developer guides',
        'Create best practices doc',
        'Build templates library',
        'Document patterns',
        'Create troubleshooting guide',
        'Record video tutorials',
        'Build knowledge base',
      ],
      tools_available: [
        'Markdown',
        'GitHub Pages',
        'Video',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['documentation', 'education', 'knowledge'],
    metadata: {
      category: 'support',
      guide_count_target: 20,
    },
  },

  {
    title: '⚡ LOW: Set Up Agent Performance Benchmarking',
    description: 'Track agent speed, accuracy, cost efficiency over time',
    priority: 'low',
    status: 'pending',
    assigned_to: 'researcher',
    context: {
      objectives: [
        'Create benchmark suite',
        'Track speed metrics',
        'Measure accuracy',
        'Calculate cost efficiency',
        'Generate reports',
        'Compare versions',
        'Identify improvements',
      ],
      tools_available: [
        'Benchmark tools',
        'Analytics',
        'Supabase',
      ],
      budget_limit_usd: 50,
      autonomous: true,
    },
    tags: ['benchmarking', 'performance', 'metrics'],
    metadata: {
      category: 'quality-assurance',
      benchmark_frequency: 'daily',
    },
  },

  {
    title: '🔍 LOW: Build Agent Failure Analysis System',
    description: 'Analyze failures, categorize issues, suggest improvements',
    priority: 'low',
    status: 'pending',
    assigned_to: 'researcher',
    context: {
      objectives: [
        'Collect failure data',
        'Categorize issues',
        'Analyze patterns',
        'Generate insights',
        'Suggest improvements',
        'Track resolution',
        'Create reports',
      ],
      tools_available: [
        'Sentry',
        'Analytics',
        'ML analysis',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['failure-analysis', 'reliability', 'insights'],
    metadata: {
      category: 'quality-assurance',
      failure_resolution_days: 7,
    },
  },

  {
    title: '📝 LOW: Create Agent Communication Logging',
    description: 'Full audit trail of inter-agent communication',
    priority: 'low',
    status: 'pending',
    assigned_to: 'scribe',
    context: {
      objectives: [
        'Log all agent messages',
        'Track message flow',
        'Create audit trail',
        'Implement filtering',
        'Build search interface',
        'Generate reports',
        'Ensure data retention',
      ],
      tools_available: [
        'Supabase',
        'Logging service',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['logging', 'audit', 'compliance'],
    metadata: {
      category: 'operations',
      retention_days: 365,
    },
  },

  // ==================== PILLAR 3: TWITTER BOT (12 missions) ====================

  {
    title: '🐦 CRITICAL: Implement Twitter/X API Integration',
    description: 'Authenticated access, rate limiting, error handling',
    priority: 'critical',
    status: 'pending',
    assigned_to: 'operator',
    context: {
      objectives: [
        'Get Twitter API credentials',
        'Implement authentication',
        'Handle rate limiting',
        'Implement error handling',
        'Create connection pooling',
        'Test endpoints',
        'Monitor API health',
      ],
      tools_available: [
        'Twitter API v2',
        'OAuth 2.0',
        'Node.js libraries',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['twitter', 'api', 'critical'],
    metadata: {
      category: 'social',
      api_version: 'v2',
    },
  },

  {
    title: '💬 HIGH: Create Smart Tweet Generator',
    description: 'Context-aware tweets, emoji use, engagement optimization',
    priority: 'high',
    status: 'pending',
    assigned_to: 'scribe',
    context: {
      objectives: [
        'Understand current context',
        'Generate contextual tweets',
        'Use emojis effectively',
        'Optimize for engagement',
        'Create variations',
        'Add personality',
        'Include relevant links',
      ],
      tools_available: [
        'GPT-4',
        'Perplexity',
        'Twitter templates',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['twitter', 'content', 'ai'],
    metadata: {
      category: 'marketing',
      tone: 'authentic',
    },
  },

  {
    title: '⏰ HIGH: Build Tweet Scheduling System',
    description: 'Hourly tweets, time zone awareness, audience analysis',
    priority: 'high',
    status: 'pending',
    assigned_to: 'operator',
    context: {
      objectives: [
        'Implement tweet scheduler',
        'Time tweets optimally',
        'Handle time zones',
        'Analyze peak times',
        'Create schedule',
        'Monitor queue',
        'Handle failures',
      ],
      tools_available: [
        'Inngest',
        'Supabase',
        'Twitter API',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['twitter', 'scheduling', 'automation'],
    metadata: {
      category: 'marketing',
      tweet_frequency: 'hourly',
    },
  },

  {
    title: '💬 HIGH: Implement Twitter Engagement Handler',
    description: 'Reply to mentions, retweet relevant content, track conversations',
    priority: 'high',
    status: 'pending',
    assigned_to: 'scribe',
    context: {
      objectives: [
        'Monitor mentions',
        'Auto-reply to mentions',
        'Retweet relevant content',
        'Track conversations',
        'Join discussions',
        'Build relationships',
        'Log interactions',
      ],
      tools_available: [
        'Twitter API',
        'Sentiment analysis',
        'Context understanding',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['twitter', 'engagement', 'community'],
    metadata: {
      category: 'community',
      response_time_minutes: 30,
    },
  },

  {
    title: '📊 MEDIUM: Create Performance Metrics Tweeter',
    description: 'Real-time stats, daily summaries, achievement announcements',
    priority: 'medium',
    status: 'pending',
    assigned_to: 'researcher',
    context: {
      objectives: [
        'Track daily metrics',
        'Create stat summaries',
        'Announce achievements',
        'Share milestones',
        'Post daily scores',
        'Celebrate wins',
        'Be transparent',
      ],
      tools_available: [
        'Supabase queries',
        'Analytics',
        'Inngest',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['twitter', 'metrics', 'analytics'],
    metadata: {
      category: 'marketing',
      metric_tweet_frequency: 'daily',
    },
  },

  {
    title: '🌟 MEDIUM: Build Community Engagement Tracker',
    description: 'Follow influential accounts, mention tracking, sentiment analysis',
    priority: 'medium',
    status: 'pending',
    assigned_to: 'researcher',
    context: {
      objectives: [
        'Identify influencers',
        'Track mentions',
        'Analyze sentiment',
        'Follow relevant accounts',
        'Build relationships',
        'Create engagement strategy',
        'Monitor trends',
      ],
      tools_available: [
        'Twitter API',
        'Sentiment analysis',
        'ML tools',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['twitter', 'community', 'analysis'],
    metadata: {
      category: 'marketing',
      influencer_target: 50,
    },
  },

  {
    title: '🧵 MEDIUM: Implement Thread Generation',
    description: 'Multi-tweet threads, story arcs, educational content',
    priority: 'medium',
    status: 'pending',
    assigned_to: 'scribe',
    context: {
      objectives: [
        'Create thread templates',
        'Generate story arcs',
        'Write educational content',
        'Break into tweet-sized chunks',
        'Add visual elements',
        'Create hooks',
        'Schedule thread posts',
      ],
      tools_available: [
        'Content generation',
        'Twitter API',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['twitter', 'content', 'education'],
    metadata: {
      category: 'marketing',
      thread_frequency: 'weekly',
    },
  },

  {
    title: '🔥 MEDIUM: Create Trending Topic Detector',
    description: 'Monitor trends, identify opportunities, craft relevant tweets',
    priority: 'medium',
    status: 'pending',
    assigned_to: 'researcher',
    context: {
      objectives: [
        'Monitor trending topics',
        'Identify relevant trends',
        'Craft timely tweets',
        'Join conversations',
        'Create trend content',
        'Track performance',
        'Learn patterns',
      ],
      tools_available: [
        'Twitter API',
        'Trend monitoring',
        'News APIs',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['twitter', 'trends', 'content'],
    metadata: {
      category: 'marketing',
      trend_update_frequency: 'hourly',
    },
  },

  {
    title: '📈 LOW: Build Tweet Analytics Dashboard',
    description: 'Engagement tracking, reach analysis, follower growth',
    priority: 'low',
    status: 'pending',
    assigned_to: 'scribe',
    context: {
      objectives: [
        'Track engagement',
        'Monitor reach',
        'Analyze impressions',
        'Track follower growth',
        'Calculate engagement rate',
        'Create visualizations',
        'Generate reports',
      ],
      tools_available: [
        'Twitter Analytics API',
        'Supabase',
        'Charting libraries',
      ],
      budget_limit_usd: 100,
      autonomous: true,
    },
    tags: ['twitter', 'analytics', 'dashboard'],
    metadata: {
      category: 'marketing',
      update_frequency_hours: 1,
    },
  },

  {
    title: '📅 LOW: Implement Content Calendar',
    description: 'Plan content themes, schedule spikes, track performance',
    priority: 'low',
    status: 'pending',
    assigned_to: 'scribe',
    context: {
      objectives: [
        'Create content calendar',
        'Plan weekly themes',
        'Schedule content',
        'Create campaign calendars',
        'Plan spikes',
        'Track performance',
        'Adjust strategy',
      ],
      tools_available: [
        'Supabase',
        'Calendar app',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['twitter', 'content', 'planning'],
    metadata: {
      category: 'marketing',
      planning_window_weeks: 4,
    },
  },

  {
    title: '#️⃣ LOW: Create Hashtag Strategy',
    description: 'Research relevant hashtags, create branded tags, track usage',
    priority: 'low',
    status: 'pending',
    assigned_to: 'researcher',
    context: {
      objectives: [
        'Research hashtags',
        'Create branded hashtags',
        'Mix relevant/niche tags',
        'Track hashtag performance',
        'Create guidelines',
        'Monitor usage',
        'Adjust strategy',
      ],
      tools_available: [
        'Twitter API',
        'Hashtag tools',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['twitter', 'content', 'seo'],
    metadata: {
      category: 'marketing',
      hashtag_count_per_tweet: 3,
    },
  },

  {
    title: '🎤 LOW: Build Brand Voice Guidelines',
    description: 'Document tone, personality, values, response templates',
    priority: 'low',
    status: 'pending',
    assigned_to: 'scribe',
    context: {
      objectives: [
        'Define brand voice',
        'Document personality',
        'Create tone guidelines',
        'Build response templates',
        'Create FAQ responses',
        'Document values',
        'Create style guide',
      ],
      tools_available: [
        'Documentation tools',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['twitter', 'branding', 'documentation'],
    metadata: {
      category: 'marketing',
      tone: 'authentic, transparent, enthusiastic',
    },
  },

  // ==================== PILLAR 4: TOOLS & ECOSYSTEM (13 missions) ====================

  {
    title: '🛠️ CRITICAL: Build Agent Template Library',
    description: 'Create reusable agent patterns, scaffolding, documentation',
    priority: 'critical',
    status: 'pending',
    assigned_to: 'operator',
    context: {
      objectives: [
        'Create agent patterns',
        'Build scaffolding',
        'Generate templates',
        'Write documentation',
        'Create examples',
        'Build CLI tools',
        'Package for reuse',
      ],
      tools_available: [
        'TypeScript',
        'NPM',
        'GitHub',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['sdk', 'templates', 'ecosystem'],
    metadata: {
      category: 'platform',
      template_count_target: 10,
    },
  },

  {
    title: '📦 HIGH: Create Open-Source SDK',
    description: 'TypeScript SDK for agent development, npm package',
    priority: 'high',
    status: 'pending',
    assigned_to: 'operator',
    context: {
      objectives: [
        'Build TypeScript SDK',
        'Create API wrappers',
        'Add type definitions',
        'Generate docs',
        'Publish to NPM',
        'Create examples',
        'Build playground',
      ],
      tools_available: [
        'TypeScript',
        'NPM',
        'GitHub Pages',
      ],
      budget_limit_usd: 100,
      autonomous: true,
    },
    tags: ['sdk', 'open-source', 'developer'],
    metadata: {
      category: 'platform',
      npm_package_name: '@nonce-syndicate/agent-sdk',
    },
  },

  {
    title: '🔌 HIGH: Build REST API for Agents',
    description: 'Agent lifecycle management, mission dispatch, result retrieval',
    priority: 'high',
    status: 'pending',
    assigned_to: 'operator',
    context: {
      objectives: [
        'Create REST API',
        'Document endpoints',
        'Implement auth',
        'Create webhooks',
        'Add rate limiting',
        'Create SDKs',
        'Build playground',
      ],
      tools_available: [
        'Next.js API routes',
        'OpenAPI',
        'Swagger',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['api', 'platform', 'developer'],
    metadata: {
      category: 'platform',
      api_base_url: '/api/v1',
    },
  },

  {
    title: '🔐 HIGH: Implement Security Scanning Tool',
    description: 'Dependency scanning, vulnerability detection, recommendations',
    priority: 'high',
    status: 'pending',
    assigned_to: 'researcher',
    context: {
      objectives: [
        'Scan dependencies',
        'Detect vulnerabilities',
        'Generate reports',
        'Create recommendations',
        'Auto-update patches',
        'Monitor security',
        'Create alerts',
      ],
      tools_available: [
        'Snyk',
        'npm audit',
        'OWASP tools',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['security', 'tools', 'automation'],
    metadata: {
      category: 'platform',
      scan_frequency: 'daily',
    },
  },

  {
    title: '📊 MEDIUM: Create Analytics Dashboard',
    description: 'Real-time metrics, agent performance, financial tracking',
    priority: 'medium',
    status: 'pending',
    assigned_to: 'operator',
    context: {
      objectives: [
        'Build metrics dashboard',
        'Track agent performance',
        'Monitor finances',
        'Create KPIs',
        'Add real-time updates',
        'Create custom views',
        'Export reports',
      ],
      tools_available: [
        'React',
        'Supabase',
        'Recharts',
      ],
      budget_limit_usd: 200,
      autonomous: true,
    },
    tags: ['dashboard', 'analytics', 'ui'],
    metadata: {
      category: 'platform',
      refresh_rate_seconds: 5,
    },
  },

  {
    title: '📚 MEDIUM: Build Code Snippet Library',
    description: 'Searchable repo, tagged examples, documentation',
    priority: 'medium',
    status: 'pending',
    assigned_to: 'scribe',
    context: {
      objectives: [
        'Create snippet database',
        'Tag snippets',
        'Build search interface',
        'Create categories',
        'Add examples',
        'Document patterns',
        'Build UI',
      ],
      tools_available: [
        'Supabase',
        'Next.js',
        'GitHub',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['documentation', 'code', 'ecosystem'],
    metadata: {
      category: 'support',
      snippet_target: 100,
    },
  },

  {
    title: '💬 MEDIUM: Set Up Community Forum',
    description: 'Discussions, Q&A, feature requests, showcase',
    priority: 'medium',
    status: 'pending',
    assigned_to: 'scribe',
    context: {
      objectives: [
        'Choose forum platform',
        'Set up categories',
        'Create moderation rules',
        'Build community',
        'Add FAQ section',
        'Create showcase',
        'Moderate actively',
      ],
      tools_available: [
        'Discourse',
        'GitHub Discussions',
        'Discord',
      ],
      budget_limit_usd: 150,
      autonomous: true,
    },
    tags: ['community', 'support', 'ecosystem'],
    metadata: {
      category: 'community',
      community_target_size: 1000,
    },
  },

  {
    title: '🎓 MEDIUM: Create Agent Development Guides',
    description: 'Tutorials, best practices, troubleshooting guides',
    priority: 'medium',
    status: 'pending',
    assigned_to: 'scribe',
    context: {
      objectives: [
        'Write tutorials',
        'Create best practices',
        'Build guides',
        'Create examples',
        'Write troubleshooting',
        'Record videos',
        'Build learning path',
      ],
      tools_available: [
        'Markdown',
        'Video',
        'GitHub Pages',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['documentation', 'education', 'support'],
    metadata: {
      category: 'support',
      guide_target: 20,
    },
  },

  {
    title: '📖 LOW: Build GitHub-Hosted Documentation',
    description: 'Auto-generated API docs, tutorials, examples',
    priority: 'low',
    status: 'pending',
    assigned_to: 'scribe',
    context: {
      objectives: [
        'Generate API docs',
        'Create tutorials',
        'Build examples',
        'Write guides',
        'Create architecture docs',
        'Add diagrams',
        'Deploy documentation',
      ],
      tools_available: [
        'Typedoc',
        'GitHub Pages',
        'Docusaurus',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['documentation', 'developer', 'open-source'],
    metadata: {
      category: 'support',
      doc_site: 'docs.nonce.syndicate.dev',
    },
  },

  {
    title: '🎯 LOW: Create Sample Applications',
    description: 'End-to-end examples, integrations, use cases',
    priority: 'low',
    status: 'pending',
    assigned_to: 'operator',
    context: {
      objectives: [
        'Create sample apps',
        'Build integrations',
        'Document use cases',
        'Create demos',
        'Build templates',
        'Add to repo',
        'Maintain samples',
      ],
      tools_available: [
        'Next.js',
        'React',
        'Node.js',
      ],
      budget_limit_usd: 50,
      autonomous: true,
    },
    tags: ['examples', 'samples', 'documentation'],
    metadata: {
      category: 'support',
      sample_app_count: 5,
    },
  },

  {
    title: '🔌 LOW: Implement Plugin Architecture',
    description: 'Extensibility framework, plugin marketplace, community contrib',
    priority: 'low',
    status: 'pending',
    assigned_to: 'operator',
    context: {
      objectives: [
        'Design plugin system',
        'Create plugin API',
        'Build plugin loader',
        'Create marketplace',
        'Add plugin discovery',
        'Enable contributions',
        'Manage versioning',
      ],
      tools_available: [
        'NPM',
        'GitHub',
      ],
      budget_limit_usd: 100,
      autonomous: true,
    },
    tags: ['plugins', 'extensibility', 'ecosystem'],
    metadata: {
      category: 'platform',
      plugin_target: 20,
    },
  },

  {
    title: '🤝 LOW: Build Integration Marketplace',
    description: 'Database of integrations, community plugins, partnerships',
    priority: 'low',
    status: 'pending',
    assigned_to: 'scribe',
    context: {
      objectives: [
        'Create marketplace',
        'List integrations',
        'Enable publishing',
        'Review submissions',
        'Create ratings',
        'Build partnerships',
        'Promote integrations',
      ],
      tools_available: [
        'Next.js',
        'Supabase',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['marketplace', 'ecosystem', 'partnerships'],
    metadata: {
      category: 'platform',
      integration_target: 50,
    },
  },

  {
    title: '🎓 LOW: Create Certification Program',
    description: 'Developer courses, certifications, badges',
    priority: 'low',
    status: 'pending',
    assigned_to: 'scribe',
    context: {
      objectives: [
        'Design certification',
        'Create courses',
        'Build quizzes',
        'Create badges',
        'Set up tracking',
        'Promote program',
        'Build community',
      ],
      tools_available: [
        'Learning platform',
        'GitHub',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['education', 'certification', 'community'],
    metadata: {
      category: 'support',
      course_count_target: 5,
    },
  },
];

async function seedEpicMissions() {
  console.log('🚀 SEEDING EPIC MISSIONS - THE NONCE SYNDICATE MASTER PLAN\n');
  console.log('═'.repeat(80));

  try {
    // Check for existing epic missions
    const { count: existingCount } = await supabase
      .from('missions')
      .select('*', { count: 'exact', head: true })
      .in('tags', ['landing-page', 'agent-development', 'twitter', 'tools-ecosystem']);

    if (existingCount && existingCount > 0) {
      console.log(`\n⚠️  Found ${existingCount} existing epic missions.\n`);
      console.log('Options:');
      console.log('  1. DELETE FROM missions WHERE created_by = "epic-seed";');
      console.log('  2. Run again after deletion\n');
      return;
    }

    console.log(`\n📋 Inserting ${epicMissions.length} EPIC missions...\n`);

    const missionsWithMetadata = epicMissions.map(mission => ({
      ...mission,
      created_by: 'epic-seed',
    }));

    const { data: inserted, error } = await supabase
      .from('missions')
      .insert(missionsWithMetadata)
      .select();

    if (error) {
      console.error('❌ Error inserting missions:', error);
      process.exit(1);
    }

    console.log(`✅ Successfully inserted ${inserted?.length || 0} EPIC missions!\n`);

    // Summary by pillar
    const byPillar = {
      'Landing Page': 0,
      'Agent Development': 0,
      'Twitter Bot': 0,
      'Tools & Ecosystem': 0,
    };

    inserted?.forEach(m => {
      if (m.tags?.includes('landing-page')) byPillar['Landing Page']++;
      else if (m.tags?.includes('infrastructure') || m.tags?.includes('devops') || m.tags?.includes('ci-cd')) {
        byPillar['Agent Development']++;
      } else if (m.tags?.includes('twitter')) byPillar['Twitter Bot']++;
      else byPillar['Tools & Ecosystem']++;
    });

    console.log('═'.repeat(80));
    console.log('\n🎯 MISSION DISTRIBUTION BY PILLAR:\n');
    Object.entries(byPillar).forEach(([pillar, count]) => {
      console.log(`   ${pillar}: ${count} missions`);
    });

    // Budget summary
    const totalBudget = inserted?.reduce((sum, m) => sum + (m.context?.budget_limit_usd || 0), 0) || 0;
    const byPriority = inserted?.reduce((acc: any, m) => {
      acc[m.priority] = (acc[m.priority] || 0) + 1;
      return acc;
    }, {});

    console.log('\n💰 TOTAL BUDGET:', `$${totalBudget.toLocaleString()}`);
    console.log('\n📊 BY PRIORITY:\n');
    Object.entries(byPriority || {}).forEach(([priority, count]) => {
      console.log(`   ${priority.toUpperCase()}: ${count} missions`);
    });

    console.log('\n═'.repeat(80));
    console.log('\n🔥 EPIC MISSION PLAN ACTIVATED!\n');
    console.log('The Nonce Syndicate is now ready for the 30-day challenge.\n');
    console.log('Next steps:');
    console.log('  1. Monitor Inngest dashboard for mission execution');
    console.log('  2. Review mission priorities in Supabase');
    console.log('  3. Implement Signer wallet operations');
    console.log('  4. Coordinate agent execution');
    console.log('  5. Scale to $50K+ presale target\n');

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run seeding
seedEpicMissions();
