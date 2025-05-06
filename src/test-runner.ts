
import { execSync } from 'child_process';
import chalk from 'chalk';

/**
 * Run all test suites and generate a report
 */
function runAllTests() {
  console.log(chalk.blue('==================================='));
  console.log(chalk.blue('🧪 Running all test suites'));
  console.log(chalk.blue('==================================='));
  
  // Set start time
  const startTime = Date.now();
  
  try {
    // Run the frontend tests
    console.log(chalk.yellow('\n📋 Running Vitest frontend tests...\n'));
    execSync('npx vitest run', { stdio: 'inherit' });
    
    console.log(chalk.green('\n✅ Frontend tests completed successfully!\n'));
    
    // Run edge function tests if we have them
    console.log(chalk.yellow('\n📋 Running edge function tests...\n'));
    
    try {
      execSync('cd supabase/functions/analyze-shelf-image && deno test', { stdio: 'inherit' });
      console.log(chalk.green('\n✅ Edge function tests completed successfully!\n'));
    } catch (error) {
      console.error(chalk.red('\n❌ Edge function tests failed.\n'));
      throw error;
    }
    
    // Calculate execution time
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(chalk.blue('==================================='));
    console.log(chalk.green(`✅ All tests passed in ${executionTime} seconds`));
    console.log(chalk.blue('==================================='));
    
  } catch (error) {
    // Calculate execution time even for failures
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(chalk.red('==================================='));
    console.log(chalk.red(`❌ Tests failed after ${executionTime} seconds`));
    console.log(chalk.red('==================================='));
    
    process.exit(1);
  }
}

// Run the tests
runAllTests();
