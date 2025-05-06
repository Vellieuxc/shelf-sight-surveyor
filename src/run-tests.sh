
#!/bin/bash

echo "Running Vitest Tests..."
npx vitest run

echo ""
echo "Running Deno Tests for edge functions..."
cd supabase/functions/analyze-shelf-image && deno run --allow-read --allow-env --allow-net tests/run-all.ts

echo ""
echo "All tests completed!"
