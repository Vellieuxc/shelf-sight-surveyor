
#!/usr/bin/env node

const { execSync } = require('child_process');
const chalk = require('chalk'); // Using chalk for colored output

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
console.log(chalk.blue('📋 Running React Component Tests:'));
const reactTestResult = runCommand('npx vitest run --reporter=verbose');

console.log(reactTestResult.output);
if (!reactTestResult.success) {
  console.error(chalk.red('❌ React tests failed:'));
  console.error(reactTestResult.error);
} else {
  console.log(chalk.green('✅ React tests passed!'));
}

// Run Supabase Edge Function tests
console.log(chalk.blue('\n📋 Running Edge Function Tests:'));
console.log('Note: These tests require Deno runtime to be installed\n');

// Check if Deno is installed
const denoCheckResult = runCommand('deno --version', { stdio: 'ignore' });
if (!denoCheckResult.success) {
  console.log(chalk.yellow('⚠️ Deno is not installed or not in PATH. Skipping Edge Function tests.'));
  console.log('   Install Deno from https://deno.com/manual@v1.29.1/getting_started/installation');
  process.exit(reactTestResult.success ? 0 : 1);
}

// Run all tests in the analyze-shelf-image function
const edgeFunctionPath = 'supabase/functions/analyze-shelf-image';
console.log(chalk.blue('Testing Claude service and transformers...'));
const edgeTestResult = runCommand(`cd ${edgeFunctionPath} && deno test --allow-net --allow-env tests/claude-service.test.ts tests/run-tests.ts`);

console.log(edgeTestResult.output);
if (!edgeTestResult.success) {
  console.error(chalk.red('❌ Edge Function tests failed:'));
  console.error(edgeTestResult.error);
} else {
  console.log(chalk.green('✅ Edge Function tests passed!'));
}

console.log(chalk.blue('\n🏁 All tests completed!'));

// Exit with appropriate code
process.exit(reactTestResult.success && edgeTestResult.success ? 0 : 1);
