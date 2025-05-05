
#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🧪 Running React Component Tests...');

try {
  console.log('\n📋 Running all Vitest tests:');
  const output = execSync('npx vitest run', { encoding: 'utf8' });
  console.log(output);
  console.log('✅ All React tests passed!');
} catch (error) {
  console.error('❌ Some tests failed:');
  console.log(error.stdout || '');
  console.error(error.stderr || error.message);
  process.exit(1);
}

console.log('\nTo run Supabase Edge Function tests:');
console.log('cd supabase/functions/analyze-shelf-image && deno run --allow-read --allow-env --allow-net tests/run-all.ts');
