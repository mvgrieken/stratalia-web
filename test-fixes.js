#!/usr/bin/env node

/**
 * Test script om de fixes te controleren
 */

const BASE_URL = 'http://localhost:3000';

async function testFix(endpoint, description) {
  try {
    console.log(`🧪 Testing: ${description}`);
    const response = await fetch(`${BASE_URL}${endpoint}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${description} - Status: ${response.status}`);
      console.log(`   Data: ${JSON.stringify(data).substring(0, 100)}...`);
      return true;
    } else {
      console.log(`❌ ${description} - Status: ${response.status}`);
      const error = await response.text();
      console.log(`   Error: ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`💥 ${description} - Network Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🔧 Testing Fixes...\n');

  const tests = [
    ['/api/words/search?query=skeer&limit=5', 'Search API with valid query'],
    ['/api/words/search?query=&limit=5', 'Search API with empty query (should return 400)'],
    ['/api/quiz?difficulty=medium&limit=5', 'Quiz API endpoint'],
    ['/api/words/daily', 'Daily word API'],
    ['/api/ai/translate', 'AI Translate API (POST)'],
  ];

  let passed = 0;
  let total = tests.length;

  for (const [endpoint, description] of tests) {
    const success = await testFix(endpoint, description);
    if (success) passed++;
    console.log('');
  }

  console.log(`📊 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All fixes working correctly!');
  } else {
    console.log('⚠️ Some issues remain, check the logs above');
  }
}

runTests().catch(console.error);
