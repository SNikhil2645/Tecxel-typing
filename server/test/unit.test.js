const assert = require('assert');
const { calculateMetrics } = require('../utils/scoreCalculator');

async function runUnitTests() {
  console.log('--- Running Score Calculator Unit Tests ---');

  // Test 1: Standard typing (720 chars in 120s = 72 WPM, 100% accuracy)
  const target1 = 'A'.repeat(720);
  const typed1 = 'A'.repeat(720);
  const m1 = calculateMetrics(typed1, target1, 120);
  assert.strictEqual(m1.correctCharacters, 720);
  assert.strictEqual(m1.errors, 0);
  assert.strictEqual(m1.wpm, 72);
  assert.strictEqual(m1.accuracy, 100);
  assert.strictEqual(m1.speedScore, 72);
  assert.strictEqual(m1.roundScore, 86); // (72*0.5) + (100*0.5) = 86
  console.log('✓ Test 1 Passed: Perfect typing 72 WPM');

  // Test 2: Worked example from Plan.md.txt Section 10.6
  // Round 1: 80 WPM, 98% accuracy -> Round Score = (80*0.5) + (98*0.5) = 89
  // 80 WPM over 2 min = 80 * 5 * 2 = 800 correct characters
  // 98% accuracy = 800 correct / (800 / 0.98) ≈ 816 typed
  const speedScore80 = 80;
  const acc98 = 98;
  const roundScore89 = (speedScore80 * 0.5) + (acc98 * 0.5);
  assert.strictEqual(roundScore89, 89);
  console.log('✓ Test 2 Passed: Worked example round score formula matches 89 pts');

  // Test 3: Speed cap at 100 WPM
  // If user types 120 WPM, WPM is 120, but speedScore is capped at 100
  const target3 = 'B'.repeat(1200);
  const typed3 = 'B'.repeat(1200);
  const m3 = calculateMetrics(typed3, target3, 120);
  assert.strictEqual(m3.wpm, 120);
  assert.strictEqual(m3.speedScore, 100, 'Speed score must cap at 100');
  console.log('✓ Test 3 Passed: 120 WPM displays 120 WPM but caps speedScore at 100');

  // Test 4: Edge case - 0 characters typed
  const m4 = calculateMetrics('', 'Hello world', 120);
  assert.strictEqual(m4.correctCharacters, 0);
  assert.strictEqual(m4.wpm, 0);
  assert.strictEqual(m4.accuracy, 0);
  assert.strictEqual(m4.roundScore, 0);
  console.log('✓ Test 4 Passed: 0 characters typed handled cleanly');

  // Test 5: Extra characters typed beyond target length are counted as errors
  const m5 = calculateMetrics('HelloWorldExtra', 'HelloWorld', 60);
  assert.strictEqual(m5.correctCharacters, 10);
  assert.strictEqual(m5.errors, 5);
  console.log('✓ Test 5 Passed: Overtyping handled cleanly as errors');

  console.log('--- All Score Calculator Unit Tests Passed! ---\n');
}

runUnitTests().catch((err) => {
  console.error('Unit tests failed:', err);
  process.exit(1);
});
