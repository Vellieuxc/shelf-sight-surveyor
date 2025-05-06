
#!/bin/bash

# Text formatting
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================${NC}"
echo -e "${BLUE}🧪 Running all test suites${NC}"
echo -e "${BLUE}====================================${NC}"

# Record start time
start_time=$(date +%s)

echo -e "\n${YELLOW}📋 Running Vitest Tests...${NC}"
npx vitest run
vitest_exit=$?

echo ""
echo -e "${YELLOW}📋 Running Deno Tests for edge functions...${NC}"
cd supabase/functions/analyze-shelf-image && deno run --allow-read --allow-env --allow-net tests/run-all.ts
deno_exit=$?

# Calculate execution time
end_time=$(date +%s)
execution_time=$((end_time - start_time))

echo -e "${BLUE}====================================${NC}"
if [ $vitest_exit -eq 0 ] && [ $deno_exit -eq 0 ]; then
  echo -e "${GREEN}✅ All tests completed successfully in ${execution_time} seconds!${NC}"
else
  echo -e "${RED}❌ Tests failed after ${execution_time} seconds${NC}"
fi
echo -e "${BLUE}====================================${NC}"

