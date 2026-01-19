#!/bin/bash

echo "🧪 AI AGENT SETUP VERIFICATION"
echo "=============================="
echo ""

# Check if API keys are present
echo "📋 Checking API Keys..."
[[ -n "$GROQ_API_KEY" ]] && echo "✅ GROQ_API_KEY present" || echo "❌ GROQ_API_KEY missing"
[[ -n "$GOOGLE_GENERATIVE_AI_API_KEY" ]] && echo "✅ GOOGLE_GENERATIVE_AI_API_KEY present" || echo "❌ GOOGLE_GENERATIVE_AI_API_KEY missing"
[[ -n "$OPENROUTER_API_KEY" ]] && echo "✅ OPENROUTER_API_KEY present" || echo "❌ OPENROUTER_API_KEY missing"
[[ -n "$MISTRAL_API_KEY" ]] && echo "✅ MISTRAL_API_KEY present" || echo "❌ MISTRAL_API_KEY missing"
echo ""

# Check if agent files exist
echo "📁 Checking Agent Files..."
[[ -f "src/agents/operator.ts" ]] && echo "✅ Operator agent exists" || echo "❌ Operator agent missing"
[[ -f "src/agents/researcher.ts" ]] && echo "✅ Researcher agent exists" || echo "❌ Researcher agent missing"
[[ -f "src/agents/scribe.ts" ]] && echo "✅ Scribe agent exists" || echo "❌ Scribe agent missing"
[[ -f "src/utils/ai-provider.ts" ]] && echo "✅ AI Provider exists" || echo "❌ AI Provider missing"
echo ""

# Check AI provider implementations
echo "🔍 Checking AI Provider Functions..."
grep -q "callAI\|callGroq\|callGemini\|callOpenRouter" src/utils/ai-provider.ts && echo "✅ AI provider functions found" || echo "❌ AI provider functions missing"
grep -q "formatMissionPrompt" src/utils/ai-provider.ts && echo "✅ Mission formatter found" || echo "❌ Mission formatter missing"
echo ""

# Check agent integration
echo "🔗 Checking Agent Integration..."
grep -q "import.*ai-provider" src/agents/operator.ts && echo "✅ Operator imports AI provider" || echo "❌ Operator doesn't import AI provider"
grep -q "import.*ai-provider" src/agents/researcher.ts && echo "✅ Researcher imports AI provider" || echo "❌ Researcher doesn't import AI provider"
grep -q "import.*ai-provider" src/agents/scribe.ts && echo "✅ Scribe imports AI provider" || echo "❌ Scribe doesn't import AI provider"
grep -q "executeMission" src/agents/operator.ts && echo "✅ Operator has mission execution" || echo "❌ Operator missing mission execution"
grep -q "executeMission" src/agents/researcher.ts && echo "✅ Researcher has mission execution" || echo "❌ Researcher missing mission execution"
grep -q "executeMission" src/agents/scribe.ts && echo "✅ Scribe has mission execution" || echo "❌ Scribe missing mission execution"
echo ""

# Check orchestrator integration
echo "🎯 Checking Signer Orchestrator Integration..."
grep -q "operatorAgent\|researcherAgent\|scribeAgent" src/inngest/functions/signer-orchestrator.ts && echo "✅ Agents imported in orchestrator" || echo "❌ Agents not imported in orchestrator"
grep -q "case 'operator'" src/inngest/functions/signer-orchestrator.ts && echo "✅ Operator case handled" || echo "❌ Operator case missing"
grep -q "case 'researcher'" src/inngest/functions/signer-orchestrator.ts && echo "✅ Researcher case handled" || echo "❌ Researcher case missing"
grep -q "case 'scribe'" src/inngest/functions/signer-orchestrator.ts && echo "✅ Scribe case handled" || echo "❌ Scribe case missing"
echo ""

echo "=============================="
echo "✨ Verification Complete"
