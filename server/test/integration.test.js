const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const contentType = res.headers.get('content-type') || '';
  let body = null;
  if (contentType.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text();
  }

  return { status: res.status, headers: res.headers, body };
}

async function runIntegrationTests() {
  console.log('--- Running Championship API Integration Tests ---\n');

  const testUser = {
    name: 'Rahul Sharma',
    rollNumber: `BCA${Date.now().toString().slice(-6)}`,
    course: 'BCA',
    year: 2,
    section: 'A',
    email: `rahul_${Date.now()}@college.edu`,
    password: 'password123',
  };

  // 1. Register Participant
  console.log('1. Testing Registration...');
  const regRes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(testUser),
  });
  assert.strictEqual(regRes.status, 201, `Expected 201 Created, got ${regRes.status}`);
  assert.ok(regRes.body.participantId, 'Should return participantId');
  assert.ok(regRes.body.token, 'Should return token');
  const participantId = regRes.body.participantId;
  const token = regRes.body.token;
  console.log(`✓ Registration succeeded. Assigned ID: ${participantId}`);

  // 2. Duplicate Check
  console.log('2. Testing Duplicate Registration Prevention...');
  const dupRes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(testUser),
  });
  assert.strictEqual(dupRes.status, 409, 'Duplicate registration should return 409');
  console.log('✓ Duplicate registration correctly rejected with 409 Conflict');

  // 3. Login
  console.log('3. Testing Participant Login...');
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ participantId, password: testUser.password }),
  });
  assert.strictEqual(loginRes.status, 200);
  assert.ok(loginRes.body.token);
  console.log('✓ Login verified');

  // 4. Initial Status
  console.log('4. Testing Competition Status...');
  const statusRes = await request('/competition/status', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(statusRes.status, 200);
  assert.strictEqual(statusRes.body.currentRound, 1);
  assert.strictEqual(statusRes.body.roundsCompleted.length, 0);
  console.log('✓ Initial competition status: Round 1 ready, 0 completed');

  // 5. Fetch Round 1 Passage (The Sprinter - 2 Minutes)
  console.log('5. Fetching Round 1 Passage (2 Minutes Duration)...');
  const p1Res = await request('/competition/round/1', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(p1Res.status, 200);
  assert.ok(p1Res.body.passage);
  const passage1 = p1Res.body.passage;
  console.log(`✓ Retrieved Round 1 passage: "${passage1.title}" (${passage1.characterCount} chars)`);

  // 6. Submit Round 1 Score (2-minute timing)
  console.log('6. Submitting Round 1 Score...');
  const now = Date.now();
  const sub1Res = await request('/results/submit', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      round: 1,
      passageId: passage1._id,
      typedText: passage1.content,
      startTime: new Date(now - 120000).toISOString(),
      endTime: new Date(now).toISOString(),
      tabSwitches: 0,
    }),
  });
  assert.strictEqual(sub1Res.status, 201);
  assert.strictEqual(sub1Res.body.round, 1);
  assert.strictEqual(sub1Res.body.accuracy, 100);
  assert.ok(sub1Res.body.wpm > 0);
  console.log(`✓ Round 1 recorded: ${sub1Res.body.wpm} WPM, ${sub1Res.body.accuracy}% Accuracy, Score: ${sub1Res.body.roundScore}`);

  // 7. Duplicate Attempt Handling (Idempotent: returns 200 with saved result, never crashes or creates duplicate)
  console.log('7. Testing Duplicate Submission Handling on Round 1...');
  const sub1Dup = await request('/results/submit', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      round: 1,
      passageId: passage1._id,
      typedText: passage1.content,
      startTime: new Date(now - 120000).toISOString(),
      endTime: new Date(now).toISOString(),
      tabSwitches: 0,
    }),
  });
  assert.strictEqual(sub1Dup.status, 200, 'Duplicate submission must return 200 with saved result');
  assert.strictEqual(sub1Dup.body.round, 1);
  console.log('✓ Idempotent submission verified: returns existing record safely with 200 OK');

  // 8. Order Progression Check (skip to Round 3 without Round 2)
  console.log('8. Testing Progression Guard (attempting Round 3 without Round 2)...');
  const skipRes = await request('/competition/round/3', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(skipRes.status, 403, 'Skipping rounds must return 403');
  console.log('✓ Progression guard verified (403 Forbidden)');

  // 9. Complete Round 2 (The Precisionist - 3 Minutes Duration)
  console.log('9. Completing Round 2 (3 Minutes Duration)...');
  const p2Res = await request('/competition/round/2', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const passage2 = p2Res.body.passage;
  const sub2Res = await request('/results/submit', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      round: 2,
      passageId: passage2._id,
      typedText: passage2.content,
      startTime: new Date(now - 180000).toISOString(), // 3 min duration
      endTime: new Date(now).toISOString(),
      tabSwitches: 0,
    }),
  });
  assert.strictEqual(sub2Res.status, 201);
  assert.strictEqual(sub2Res.body.round, 2);
  console.log(`✓ Round 2 recorded: ${sub2Res.body.wpm} WPM, Score: ${sub2Res.body.roundScore}`);

  // 10. Complete Round 3 (The Typing Master - 5 Minutes Duration)
  console.log('10. Completing Round 3 (5 Minutes Duration)...');
  const p3Res = await request('/competition/round/3', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const passage3 = p3Res.body.passage;
  const sub3Res = await request('/results/submit', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      round: 3,
      passageId: passage3._id,
      typedText: passage3.content,
      startTime: new Date(now - 300000).toISOString(), // 5 min duration
      endTime: new Date(now).toISOString(),
      tabSwitches: 0,
    }),
  });
  assert.strictEqual(sub3Res.status, 201, 'First submission of Round 3 must succeed with 201');
  assert.ok(sub3Res.body.finalScore !== null, 'Round 3 completion must compute finalScore');

  // Verify final score formula: (r1 + r2 + r3) / 3
  const expectedAvg = Math.round(((sub1Res.body.roundScore + sub2Res.body.roundScore + sub3Res.body.roundScore) / 3) * 100) / 100;
  assert.strictEqual(sub3Res.body.finalScore, expectedAvg, 'Final score must equal average of 3 round scores');
  console.log(`✓ Round 3 first submission succeeded! Final Championship Score: ${sub3Res.body.finalScore} pts (Formula: ${expectedAvg})`);

  // Test Round 3 duplicate submission (participant clicked submit button multiple times)
  console.log('10b. Testing Rapid/Duplicate Round 3 Submit...');
  const sub3Dup = await request('/results/submit', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      round: 3,
      passageId: passage3._id,
      typedText: passage3.content,
      startTime: new Date(now - 300000).toISOString(),
      endTime: new Date(now).toISOString(),
      tabSwitches: 0,
    }),
  });
  assert.strictEqual(sub3Dup.status, 200, 'Duplicate submission must cleanly return 200 with saved result');
  assert.strictEqual(sub3Dup.body.finalScore, sub3Res.body.finalScore);
  console.log('✓ Duplicate submission on Round 3 handled cleanly without errors');

  // 11. Verify Results Summary
  console.log('11. Testing /api/results/my-results...');
  const myRes = await request('/results/my-results', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(myRes.status, 200);
  assert.strictEqual(myRes.body.rounds.length, 3);
  assert.ok(myRes.body.rank >= 1);
  console.log(`✓ Results summary verified: 3 rounds recorded, rank: #${myRes.body.rank}`);

  // 12. Check Public Leaderboard
  console.log('12. Testing Public Leaderboard...');
  const leadRes = await request('/leaderboard');
  assert.strictEqual(leadRes.status, 200);
  const foundInLeaderboard = leadRes.body.leaderboard.find((l) => l.participantId === participantId);
  assert.ok(foundInLeaderboard, 'Participant must appear in public leaderboard');
  console.log(`✓ Leaderboard verified: Participant ${participantId} ranked #${foundInLeaderboard.rank} with score ${foundInLeaderboard.finalScore}`);

  // 13. Admin Controls
  console.log('13. Testing Admin Controls...');
  const adminLoginRes = await request('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@tecxl.com', password: 'admin123' }),
  });
  assert.strictEqual(adminLoginRes.status, 200);
  const adminToken = adminLoginRes.body.token;

  const dashRes = await request('/admin/dashboard', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(dashRes.status, 200);
  assert.ok(dashRes.body.completed.allThree >= 1);
  console.log(`✓ Admin dashboard verified: Total Finishers = ${dashRes.body.completed.allThree}`);

  // 14. Admin Delete Participant Test
  console.log('14. Testing Admin Delete Participant Flow...');
  // Create a second participant to delete
  const userToDelete = {
    name: 'Temporary User',
    rollNumber: `TEMP${Date.now().toString().slice(-6)}`,
    course: 'BCA',
    year: 1,
    section: 'B',
    email: `temp_${Date.now()}@college.edu`,
    password: 'password123',
  };
  const tempReg = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userToDelete),
  });
  const tempId = tempReg.body.participantId;
  const tempToken = tempReg.body.token;

  // Submit round 1 for user to delete
  await request('/results/submit', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tempToken}` },
    body: JSON.stringify({
      round: 1,
      passageId: passage1._id,
      typedText: passage1.content,
      startTime: new Date(now - 120000).toISOString(),
      endTime: new Date(now).toISOString(),
      tabSwitches: 0,
    }),
  });

  // Verify unauthorized deletion fails
  const unauthDelete = await request(`/admin/participant/${tempId}`, {
    method: 'DELETE',
  });
  assert.strictEqual(unauthDelete.status, 401, 'Unauthorized delete must return 401');
  console.log('✓ Security verified: Non-admin cannot delete participants (401 Unauthorized)');

  // Perform authorized admin delete
  const authDelete = await request(`/admin/participant/${tempId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(authDelete.status, 200, 'Admin delete must return 200');
  assert.strictEqual(authDelete.body.success, true);
  console.log(`✓ Authorized admin delete succeeded for ${tempId}`);

  // Verify participant is gone from DB
  const verifyLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ participantId: tempId, password: userToDelete.password }),
  });
  assert.strictEqual(verifyLogin.status, 401, 'Deleted participant must not be able to log in');

  // Verify associated results are also gone
  const resultsCheck = await request(`/admin/results?participantId=${tempId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(resultsCheck.body.results.length, 0, 'No orphaned results must remain after participant deletion');
  console.log('✓ Clean deletion verified: participant record and all associated results removed from MongoDB');

  // 15. Admin CSV Export
  console.log('15. Testing CSV Export...');
  const expRes = await request('/admin/export?format=csv', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(expRes.status, 200);
  assert.ok(expRes.body.includes('Participant ID'));
  assert.ok(expRes.body.includes(participantId));
  console.log('✓ Admin CSV export verified with correct column headers and participant record');

  console.log('\n=============================================');
  console.log(' ALL 15 INTEGRATION TESTS PASSED 100%! ');
  console.log('=============================================\n');
}

runIntegrationTests().catch((err) => {
  console.error('Integration tests failed:', err);
  process.exit(1);
});
