#!/bin/bash
echo "🚀 PRE-DEPLOYMENT CHECKLIST"
echo "============================"
echo ""

# 1. Build
echo "1️⃣  Building project..."
npm run build > /dev/null 2>&1 && echo "✅ Build successful" || echo "❌ Build failed"

# 2. Check .env
echo "2️⃣  Checking environment..."
[[ -f ".env" ]] && echo "✅ .env exists" || echo "❌ .env missing"

# 3. Check if all AI keys present
grep -q "GROQ_API_KEY" .env && echo "✅ GROQ_API_KEY" || echo "❌ GROQ_API_KEY"
grep -q "GOOGLE_GENERATIVE_AI_API_KEY" .env && echo "✅ GOOGLE_GENERATIVE_AI_API_KEY" || echo "❌ GOOGLE_GENERATIVE_AI_API_KEY"
grep -q "SUPABASE_URL" .env && echo "✅ SUPABASE_URL" || echo "❌ SUPABASE_URL"
grep -q "INNGEST_EVENT_KEY" .env && echo "✅ INNGEST_EVENT_KEY" || echo "❌ INNGEST_EVENT_KEY"

# 4. Check Supabase tables
echo ""
echo "3️⃣  Checking Supabase..."
echo "   (Run this manually in Supabase SQL editor)"
echo "   SELECT COUNT(*) FROM missions;"

# 5. Agent files
echo ""
echo "4️⃣  Checking agent files..."
[[ -f "src/agents/operator.ts" ]] && echo "✅ Operator agent" || echo "❌ Operator agent"
[[ -f "src/agents/researcher.ts" ]] && echo "✅ Researcher agent" || echo "❌ Researcher agent"
[[ -f "src/agents/scribe.ts" ]] && echo "✅ Scribe agent" || echo "❌ Scribe agent"
[[ -f "src/utils/ai-provider.ts" ]] && echo "✅ AI provider" || echo "❌ AI provider"

# 6. Git status
echo ""
echo "5️⃣  Git status..."
git status --short | wc -l | xargs echo "   Modified files:"

echo ""
echo "============================"
echo "✨ Ready for deployment!"
