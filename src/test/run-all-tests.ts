#!/usr/bin/env node

import { spawnSync } from 'child_process';
import chalk from 'chalk';

console.log(chalk.blue('🧪 Running All Tests...'));

// Function to run a test command and return the result
function runTests(command: string, description: string): { success: boolean, output: string } {
  console.log(chalk.cyan(`\n📋 ${description}:`));
  
  try {
    const result = spawnSync(command, { shell: true, stdio: 'pipe', encoding: 'utf8' });
    
    if (result.status !== 0) {
      console.log(chalk.red('❌ Failed'));
      console.log(result.stdout || '');
      console.error(result.stderr || '');
      return { success: false, output: result.stderr || result.stdout || '' };
    }
    
    console.log(chalk.green('✅ Passed'));
    return { success: true, output: result.stdout };
  } catch (error) {
    console.log(chalk.red('❌ Error running tests'));
    console.error(error);
    return { success: false, output: String(error) };
  }
}

// Run React component and integration tests
const unitTestsResult = runTests('npx vitest run', 'Running Unit & Integration Tests');

// Run Core analysis service tests specifically
const analysisTestsResult = runTests(
  'npx vitest run src/services/analysis',
  'Running Analysis Service Tests'
);

// Report summary
console.log(chalk.blue('\n🏁 Test Summary:'));
console.log(`Unit & Integration Tests: ${unitTestsResult.success ? chalk.green('PASSED') : chalk.red('FAILED')}`);
console.log(`Analysis Service Tests: ${analysisTestsResult.success ? chalk.green('PASSED') : chalk.red('FAILED')}`);

// Exit with appropriate code for CI integration
if (!unitTestsResult.success || !analysisTestsResult.success) {
  console.log(chalk.red('\n❌ Some tests failed.'));
  process.exit(1);
} else {
  console.log(chalk.green('\n✅ All tests passed!'));
  process.exit(0);
}
