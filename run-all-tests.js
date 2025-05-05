
#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running All Tests...\n');

// Function to run command and return output
function runCommand(command, options = {}) {
  try {
    const output = execSync(command, { encoding: 'utf8', ...options });
    return { success: true, output };
  } catch (error) {
    return { 
      success: false, 
      output: error.stdout || '', 
      error: error.stderr || error.message 
    };
  }
}

// Run React component tests
console.log('📋 Running React Component Tests:');
const reactTestResult = runCommand('npx vitest run --reporter=verbose');

console.log(reactTestResult.output);
if (!reactTestResult.success) {
  console.error('❌ React tests failed:');
  console.error(reactTestResult.error);
} else {
  console.log('✅ React tests passed!');
}

// Don't run Edge function tests if React tests failed
if (!reactTestResult.success) {
  console.log('\n❌ Skipping Edge Function tests due to React test failures');
  process.exit(1);
}

// Run Supabase Edge Function tests (if Deno is available)
console.log('\n📋 Running Edge Function Tests:');
console.log('Note: These tests require Deno runtime to be installed\n');

const edgeFunctionPath = path.join('supabase', 'functions', 'analyze-shelf-image');
const edgeTestResult = runCommand(`cd ${edgeFunctionPath} && deno run --allow-read --allow-env --allow-net tests/run-all.ts`);

console.log(edgeTestResult.output);
if (!edgeTestResult.success) {
  console.error('❌ Edge Function tests failed:');
  console.error(edgeTestResult.error);
} else {
  console.log('✅ Edge Function tests passed!');
}

console.log('\n🏁 All tests completed!');

// Exit with appropriate code
process.exit(reactTestResult.success && edgeTestResult.success ? 0 : 1);
