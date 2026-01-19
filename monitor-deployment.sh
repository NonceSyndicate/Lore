#!/bin/bash

# 🎯 DEPLOYMENT MONITORING SCRIPT
# Monitor the AI agent system deployment and first execution

echo ""
echo "🎯 NONCE SYNDICATE - DEPLOYMENT MONITOR"
echo "========================================"
echo "$(date)"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Check Vercel deployment
echo -e "${BLUE}1️⃣  VERCEL DEPLOYMENT STATUS${NC}"
echo "---"
VERCEL_STATUS=$(curl -s https://api.vercel.com/v13/deployments?teamId=TEAM_ID | jq -r '.deployments[0].state' 2>/dev/null || echo "Unable to check")
if [ "$VERCEL_STATUS" == "READY" ]; then
  echo -e "${GREEN}✅ READY${NC}"
elif [ "$VERCEL_STATUS" == "BUILDING" ]; then
  echo -e "${YELLOW}🔄 BUILDING${NC}"
else
  echo -e "Status: $VERCEL_STATUS"
fi
echo ""

# 2. Check health endpoint
echo -e "${BLUE}2️⃣  HEALTH CHECK${NC}"
echo "---"
HEALTH=$(curl -s https://lore.vercel.app/api/health 2>/dev/null || echo "No response")
if [[ $HEALTH == *"healthy"* ]]; then
  echo -e "${GREEN}✅ HEALTHY${NC}"
  echo "$HEALTH" | jq '.' 2>/dev/null || echo "$HEALTH"
else
  echo -e "${YELLOW}🔄 CHECKING...${NC}"
  echo "Endpoint not yet responding (still deploying)"
fi
echo ""

# 3. Display next scheduled execution
echo -e "${BLUE}3️⃣  NEXT SCHEDULED EXECUTION${NC}"
echo "---"
CURRENT_MIN=$(date +%M)
NEXT_CYCLE=$((($CURRENT_MIN / 30 + 1) * 30))
if [ $NEXT_CYCLE -ge 60 ]; then
  NEXT_CYCLE=$((NEXT_CYCLE - 60))
  NEXT_HOUR=$(($(date +%H) + 1))
  if [ $NEXT_HOUR -ge 24 ]; then
    NEXT_HOUR=0
  fi
  NEXT_TIME=$(printf "%02d:%02d" $NEXT_HOUR $NEXT_CYCLE)
else
  NEXT_TIME=$(printf "%02d:%02d" $(date +%H) $NEXT_CYCLE)
fi
echo "Next mission execution at: ${NEXT_TIME}"
echo ""

# 4. Dashboard links
echo -e "${BLUE}4️⃣  MONITORING DASHBOARDS${NC}"
echo "---"
echo "🔗 Vercel Deployments:"
echo "   https://vercel.com/noncesyndicate/lore/deployments"
echo ""
echo "🔗 Inngest Functions:"
echo "   https://app.inngest.com/env/production/functions/signer-orchestrator"
echo ""
echo "🔗 Supabase Missions:"
echo "   https://app.supabase.com/project/teppzapjhkwoguwlfdvy/editor/missions"
echo ""

# 5. Quick commands
echo -e "${BLUE}5️⃣  USEFUL COMMANDS${NC}"
echo "---"
echo "Monitor logs in real-time:"
echo "  npm run dev"
echo ""
echo "Check health endpoint:"
echo "  curl https://lore.vercel.app/api/health"
echo ""
echo "View recent mission logs (if DB connected):"
echo "  psql \$DATABASE_URL -c \"SELECT * FROM mission_logs ORDER BY created_at DESC LIMIT 10;\""
echo ""

echo "========================================"
echo "✨ Deployment Monitor Complete"
echo ""
echo "Next check in 30 seconds..."
echo "Press Ctrl+C to exit"
echo ""
