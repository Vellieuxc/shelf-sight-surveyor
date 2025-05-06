
import { execSync } from 'child_process';
import chalk from 'chalk';

/**
 * Run all test suites and generate a report with enhanced performance metrics
 */
function runAllTests() {
  console.log(chalk.blue('==================================='));
  console.log(chalk.blue('🧪 Running all test suites'));
  console.log(chalk.blue('==================================='));
  
  // Set start time
  const startTime = Date.now();
  const results = { passed: 0, failed: 0, skipped: 0 };
  
  try {
    // Run the frontend tests
    console.log(chalk.yellow('\n📋 Running Vitest frontend tests...\n'));
    const frontendStart = Date.now();
    
    try {
      const frontendOutput = execSync('npx vitest run', { encoding: 'utf8' });
      const frontendTime = ((Date.now() - frontendStart) / 1000).toFixed(2);
      
      // Parse test results (could be enhanced to extract actual numbers)
      console.log(chalk.green(`\n✅ Frontend tests completed in ${frontendTime}s\n`));
      
      // Extract test metrics from output
      const passedMatch = frontendOutput.match(/(\d+) passed/);
      const failedMatch = frontendOutput.match(/(\d+) failed/);
      const skippedMatch = frontendOutput.match(/(\d+) skipped/);
      
      if (passedMatch) results.passed += parseInt(passedMatch[1]);
      if (failedMatch) results.failed += parseInt(failedMatch[1]);
      if (skippedMatch) results.skipped += parseInt(skippedMatch[1]);
      
    } catch (error) {
      console.error(chalk.red('\n❌ Frontend tests failed.\n'));
      throw error;
    }
    
    // Run edge function tests if we have them
    console.log(chalk.yellow('\n📋 Running edge function tests...\n'));
    const edgeStart = Date.now();
    
    try {
      const edgeOutput = execSync('cd supabase/functions/analyze-shelf-image && deno test', { encoding: 'utf8' });
      const edgeTime = ((Date.now() - edgeStart) / 1000).toFixed(2);
      
      console.log(chalk.green(`\n✅ Edge function tests completed in ${edgeTime}s\n`));
      
      // Extract test metrics if possible from Deno output
    } catch (error) {
      console.error(chalk.red('\n❌ Edge function tests failed.\n'));
      throw error;
    }
    
    // Calculate execution time
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // Generate test summary
    console.log(chalk.blue('==================================='));
    console.log(chalk.green(`✅ All tests passed in ${executionTime} seconds`));
    if (results.passed > 0) console.log(chalk.green(`   Passed: ${results.passed} tests`));
    if (results.skipped > 0) console.log(chalk.yellow(`   Skipped: ${results.skipped} tests`));
    console.log(chalk.blue('==================================='));
    
  } catch (error) {
    // Calculate execution time even for failures
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(chalk.red('==================================='));
    console.log(chalk.red(`❌ Tests failed after ${executionTime} seconds`));
    if (results.passed > 0) console.log(chalk.green(`   Passed: ${results.passed} tests`));
    if (results.failed > 0) console.log(chalk.red(`   Failed: ${results.failed} tests`));
    if (results.skipped > 0) console.log(chalk.yellow(`   Skipped: ${results.skipped} tests`));
    console.log(chalk.red('==================================='));
    
    process.exit(1);
  }
}

// Run the tests
runAllTests();
