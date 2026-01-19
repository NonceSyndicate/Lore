-- Manual SQL Insert Statements for 47 Epic Missions
-- The Nonce Syndicate Master Battle Plan
-- 
-- Usage: Copy each section into Supabase SQL Editor and execute
-- Or use the seed script: npx ts-node src/scripts/seed-epic-missions.ts

-- ============================================================================
-- PILLAR 1: LANDING PAGE (8 Missions)
-- ============================================================================

INSERT INTO missions (
  title, description, priority, status, assigned_to, 
  context, tags, metadata, created_by
) VALUES (
  '🌐 CRITICAL: Design Presale Landing Page',
  'Create a high-converting landing page with email capture, presale offer, and social proof',
  'critical',
  'pending',
  'signer',
  jsonb_build_object(
    'objectives', jsonb_build_array(
      'Design beautiful, modern landing page',
      'Implement email capture form',
      'Add presale offer prominently',
      'Include social proof sections',
      'Mobile-first responsive design',
      'Fast load times (<2s)',
      'Clear CTA placement'
    ),
    'tools_available', jsonb_build_array('Next.js', 'Tailwind CSS', 'Vercel', 'Figma', 'Email service'),
    'budget_limit_usd', 500,
    'autonomous', false
  ),
  ARRAY['landing-page', 'critical', 'presale', 'marketing'],
  jsonb_build_object('category', 'marketing', 'milestone', 'phase-1', 'conversion_target', 0.05),
  'epic-seed'
);

INSERT INTO missions (
  title, description, priority, status, assigned_to,
  context, tags, metadata, created_by
) VALUES (
  '📧 HIGH: Set Up Email Campaign Infrastructure',
  'Configure email service, create templates, set up automation for presale funnel',
  'high',
  'pending',
  'scribe',
  jsonb_build_object(
    'objectives', jsonb_build_array(
      'Choose email provider',
      'Set up email templates',
      'Create welcome sequence',
      'Build presale announcement template',
      'Configure automation triggers',
      'Set up segmentation',
      'Monitor deliverability'
    ),
    'tools_available', jsonb_build_array('Mailgun', 'SendGrid', 'Substack', 'Supabase Auth'),
    'budget_limit_usd', 200,
    'autonomous', true
  ),
  ARRAY['email', 'marketing', 'automation'],
  jsonb_build_object('category', 'marketing', 'email_list_target', 5000),
  'epic-seed'
);

INSERT INTO missions (
  title, description, priority, status, assigned_to,
  context, tags, metadata, created_by
) VALUES (
  '💰 HIGH: Create Presale Offer & Pricing Strategy',
  'Define presale tiers, pricing, bonuses, and urgency mechanics',
  'high',
  'pending',
  'signer',
  jsonb_build_object(
    'objectives', jsonb_build_array(
      'Define 3-5 presale tiers',
      'Set pricing for each tier',
      'Create bonus structure',
      'Design urgency mechanics',
      'Plan limited-time offers',
      'Create scarcity messaging',
      'Document terms & conditions'
    ),
    'tools_available', jsonb_build_array('Spreadsheet analysis', 'Market research', 'Competitor analysis'),
    'budget_limit_usd', 0,
    'autonomous', false
  ),
  ARRAY['presale', 'pricing', 'strategy'],
  jsonb_build_object('category', 'business', 'presale_target_usd', 50000),
  'epic-seed'
);

INSERT INTO missions (
  title, description, priority, status, assigned_to,
  context, tags, metadata, created_by
) VALUES (
  '📊 HIGH: Implement Analytics & Tracking',
  'Set up GA4, heatmaps, conversion tracking, and A/B testing',
  'high',
  'pending',
  'operator',
  jsonb_build_object(
    'objectives', jsonb_build_array(
      'Set up Google Analytics 4',
      'Add heatmap tracking',
      'Implement conversion funnels',
      'Configure A/B testing',
      'Set up UTM tracking',
      'Create dashboards',
      'Monitor daily metrics'
    ),
    'tools_available', jsonb_build_array('Google Analytics', 'Hotjar', 'Mixpanel', 'Custom tracking'),
    'budget_limit_usd', 50,
    'autonomous', true
  ),
  ARRAY['analytics', 'marketing', 'optimization'],
  jsonb_build_object('category', 'data', 'metric_update_frequency', 'hourly'),
  'epic-seed'
);

INSERT INTO missions (
  title, description, priority, status, assigned_to,
  context, tags, metadata, created_by
) VALUES (
  '⭐ MEDIUM: Create Social Proof & Testimonials',
  'Gather testimonials, create case studies, and build credibility',
  'medium',
  'pending',
  'scribe',
  jsonb_build_object(
    'objectives', jsonb_build_array(
      'Collect testimonials from early users',
      'Create case studies',
      'Add social proof elements',
      'Include metrics and results',
      'Add video testimonials',
      'Build trust badges',
      'Create comparison content'
    ),
    'tools_available', jsonb_build_array('Email outreach', 'Video recording', 'Testimonial platforms'),
    'budget_limit_usd', 100,
    'autonomous', true
  ),
  ARRAY['social-proof', 'credibility', 'marketing'],
  jsonb_build_object('category', 'marketing', 'testimonial_target', 10),
  'epic-seed'
);

INSERT INTO missions (
  title, description, priority, status, assigned_to,
  context, tags, metadata, created_by
) VALUES (
  '⚡ MEDIUM: Optimize for SEO & Performance',
  'Achieve Lighthouse score >95, Core Web Vitals, and SEO optimization',
  'medium',
  'pending',
  'operator',
  jsonb_build_object(
    'objectives', jsonb_build_array(
      'Achieve Lighthouse score >95',
      'Optimize Core Web Vitals',
      'Improve SEO metadata',
      'Optimize images',
      'Minify CSS/JS',
      'Implement caching',
      'Monitor page speed'
    ),
    'tools_available', jsonb_build_array('Lighthouse', 'PageSpeed Insights', 'Vercel Analytics', 'SEMrush'),
    'budget_limit_usd', 0,
    'autonomous', true
  ),
  ARRAY['seo', 'performance', 'optimization'],
  jsonb_build_object('category', 'technical', 'lighthouse_target', 95),
  'epic-seed'
);

INSERT INTO missions (
  title, description, priority, status, assigned_to,
  context, tags, metadata, created_by
) VALUES (
  '📢 MEDIUM: Set Up Multi-Channel Presale',
  'Create presence across Landing page, Email, Twitter, Discord, Reddit',
  'medium',
  'pending',
  'scribe',
  jsonb_build_object(
    'objectives', jsonb_build_array(
      'Create Discord server',
      'Set up Reddit community',
      'Launch Twitter presale campaign',
      'Create email drip campaign',
      'Build landing page funnel',
      'Coordinate messaging across channels',
      'Track channel performance'
    ),
    'tools_available', jsonb_build_array('Discord API', 'Reddit API', 'Twitter API', 'Email service'),
    'budget_limit_usd', 150,
    'autonomous', true
  ),
  ARRAY['multi-channel', 'presale', 'marketing'],
  jsonb_build_object('category', 'marketing', 'channels', '["web", "email", "twitter", "discord", "reddit"]'::jsonb),
  'epic-seed'
);

INSERT INTO missions (
  title, description, priority, status, assigned_to,
  context, tags, metadata, created_by
) VALUES (
  '❓ LOW: Create Presale FAQ & Resources',
  'Create FAQ, guides, how-to videos, and support documentation',
  'low',
  'pending',
  'scribe',
  jsonb_build_object(
    'objectives', jsonb_build_array(
      'Write comprehensive FAQ',
      'Create presale guide',
      'Record how-to videos',
      'Build support docs',
      'Create troubleshooting guide',
      'Add payment instructions',
      'Document refund policy'
    ),
    'tools_available', jsonb_build_array('Documentation tools', 'Video recording', 'Knowledge base software'),
    'budget_limit_usd', 0,
    'autonomous', true
  ),
  ARRAY['documentation', 'support', 'faq'],
  jsonb_build_object('category', 'support', 'faq_items_target', 50),
  'epic-seed'
);

-- ============================================================================
-- PILLAR 2: AGENT DEVELOPMENT (14 Missions)
-- ============================================================================

INSERT INTO missions (
  title, description, priority, status, assigned_to,
  context, tags, metadata, created_by
) VALUES (
  '🌳 CRITICAL: Implement Feature Branch Strategy',
  'Create branch naming convention, protection rules, auto-delete policy',
  'critical',
  'pending',
  'operator',
  jsonb_build_object(
    'objectives', jsonb_build_array(
      'Define branch naming convention',
      'Set up branch protection rules',
      'Configure auto-delete old branches',
      'Create branch review process',
      'Document branch strategy',
      'Set up status checks',
      'Configure merge requirements'
    ),
    'tools_available', jsonb_build_array('GitHub API', 'GitHub Actions', 'Vercel'),
    'budget_limit_usd', 0,
    'autonomous', true
  ),
  ARRAY['infrastructure', 'devops', 'critical'],
  jsonb_build_object('category', 'development', 'branch_strategy', 'git-flow'),
  'epic-seed'
);

INSERT INTO missions (
  title, description, priority, status, assigned_to,
  context, tags, metadata, created_by
) VALUES (
  '🔄 CRITICAL: Set Up CI/CD Auto-Merge Pipeline',
  'GitHub Actions automation for auto-merge on tests passing, rollback capability',
  'critical',
  'pending',
  'operator',
  jsonb_build_object(
    'objectives', jsonb_build_array(
      'Create GitHub Actions workflow',
      'Auto-merge on tests passing',
      'Implement rollback capability',
      'Add performance checks',
      'Create deployment logs',
      'Set up failure notifications',
      'Configure retry logic'
    ),
    'tools_available', jsonb_build_array('GitHub Actions', 'Vercel', 'Inngest', 'Supabase'),
    'budget_limit_usd', 200,
    'autonomous', true
  ),
  ARRAY['ci-cd', 'devops', 'critical'],
  jsonb_build_object('category', 'development', 'deployment_frequency', 'hourly'),
  'epic-seed'
);

INSERT INTO missions (
  title, description, priority, status, assigned_to,
  context, tags, metadata, created_by
) VALUES (
  '🧪 HIGH: Implement Automated Testing Suite',
  'Unit tests, integration tests, E2E tests with >80% coverage',
  'high',
  'pending',
  'operator',
  jsonb_build_object(
    'objectives', jsonb_build_array(
      'Create unit test suite',
      'Build integration tests',
      'Implement E2E tests',
      'Achieve >80% coverage',
      'Set up test CI/CD',
      'Create test data fixtures',
      'Monitor test performance'
    ),
    'tools_available', jsonb_build_array('Jest', 'Cypress', 'Vitest', 'Playwright'),
    'budget_limit_usd', 100,
    'autonomous', true
  ),
  ARRAY['testing', 'quality', 'devops'],
  jsonb_build_object('category', 'quality-assurance', 'coverage_target', 0.80),
  'epic-seed'
);

-- Continuing with remaining missions... (14 more for Agent Dev)
-- [Additional Agent Development missions truncated for brevity - see full script]

-- ============================================================================
-- PILLAR 3: TWITTER BOT (12 Missions)
-- ============================================================================

INSERT INTO missions (
  title, description, priority, status, assigned_to,
  context, tags, metadata, created_by
) VALUES (
  '🐦 CRITICAL: Implement Twitter/X API Integration',
  'Authenticated access, rate limiting, error handling',
  'critical',
  'pending',
  'operator',
  jsonb_build_object(
    'objectives', jsonb_build_array(
      'Get Twitter API credentials',
      'Implement authentication',
      'Handle rate limiting',
      'Implement error handling',
      'Create connection pooling',
      'Test endpoints',
      'Monitor API health'
    ),
    'tools_available', jsonb_build_array('Twitter API v2', 'OAuth 2.0', 'Node.js libraries'),
    'budget_limit_usd', 0,
    'autonomous', true
  ),
  ARRAY['twitter', 'api', 'critical'],
  jsonb_build_object('category', 'social', 'api_version', 'v2'),
  'epic-seed'
);

-- [Twitter missions continued in full script]

-- ============================================================================
-- PILLAR 4: TOOLS & ECOSYSTEM (13 Missions)
-- ============================================================================

INSERT INTO missions (
  title, description, priority, status, assigned_to,
  context, tags, metadata, created_by
) VALUES (
  '🛠️ CRITICAL: Build Agent Template Library',
  'Create reusable agent patterns, scaffolding, documentation',
  'critical',
  'pending',
  'operator',
  jsonb_build_object(
    'objectives', jsonb_build_array(
      'Create agent patterns',
      'Build scaffolding',
      'Generate templates',
      'Write documentation',
      'Create examples',
      'Build CLI tools',
      'Package for reuse'
    ),
    'tools_available', jsonb_build_array('TypeScript', 'NPM', 'GitHub'),
    'budget_limit_usd', 0,
    'autonomous', true
  ),
  ARRAY['sdk', 'templates', 'ecosystem'],
  jsonb_build_object('category', 'platform', 'template_count_target', 10),
  'epic-seed'
);

-- [Ecosystem missions continued in full script]

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check total inserted (should be 47)
-- SELECT COUNT(*) as total FROM missions WHERE created_by = 'epic-seed';

-- Check by pillar
-- SELECT 
--   CASE 
--     WHEN tags @> ARRAY['landing-page']::text[] THEN 'Landing Page'
--     WHEN tags @> ARRAY['devops']::text[] THEN 'Agent Development'
--     WHEN tags @> ARRAY['twitter']::text[] THEN 'Twitter Bot'
--     ELSE 'Tools & Ecosystem'
--   END as pillar,
--   COUNT(*) as count
-- FROM missions
-- WHERE created_by = 'epic-seed'
-- GROUP BY pillar;

-- Check by priority
-- SELECT priority, COUNT(*) as count
-- FROM missions
-- WHERE created_by = 'epic-seed'
-- GROUP BY priority
-- ORDER BY CASE priority
--   WHEN 'critical' THEN 1
--   WHEN 'high' THEN 2
--   WHEN 'medium' THEN 3
--   WHEN 'low' THEN 4
-- END;

-- Total budget
-- SELECT SUM((context->>'budget_limit_usd')::int) as total_budget
-- FROM missions
-- WHERE created_by = 'epic-seed';

-- ============================================================================
-- CLEANUP (if needed)
-- ============================================================================

-- To delete all epic missions and start fresh:
-- DELETE FROM missions WHERE created_by = 'epic-seed';
-- DELETE FROM mission_logs WHERE mission_id IN (SELECT id FROM missions WHERE created_by = 'epic-seed');
-- DELETE FROM mission_results WHERE mission_id IN (SELECT id FROM missions WHERE created_by = 'epic-seed');

-- Note: For complete SQL INSERT statements for all 47 missions, run the TypeScript seed script:
-- npx ts-node src/scripts/seed-epic-missions.ts
-- 
-- This script is the authoritative source for all mission data and will provide
-- better error handling and verification than manual SQL inserts.
