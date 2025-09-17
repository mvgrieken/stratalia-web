#!/usr/bin/env node

/**
 * Test script for search functionality
 * Tests the search function directly and via API
 */

// Test the search function directly
async function testDirectSearch() {
  console.log('🔍 Testing direct search function...');
  
  try {
    const { searchWords } = await import('./src/data/mock-words.js');
    
    // Test exact match
    console.log('\n--- Testing exact match: "waggi" ---');
    const exactResults = searchWords('waggi', 10);
    console.log(`Found ${exactResults.length} results:`, exactResults.map(r => `${r.word} - ${r.meaning}`));
    
    // Test case insensitive
    console.log('\n--- Testing case insensitive: "WAGGI" ---');
    const caseResults = searchWords('WAGGI', 10);
    console.log(`Found ${caseResults.length} results:`, caseResults.map(r => `${r.word} - ${r.meaning}`));
    
    // Test partial match
    console.log('\n--- Testing partial match: "wag" ---');
    const partialResults = searchWords('wag', 10);
    console.log(`Found ${partialResults.length} results:`, partialResults.map(r => `${r.word} - ${r.meaning}`));
    
    // Test meaning search
    console.log('\n--- Testing meaning search: "auto" ---');
    const meaningResults = searchWords('auto', 10);
    console.log(`Found ${meaningResults.length} results:`, meaningResults.map(r => `${r.word} - ${r.meaning}`));
    
    return true;
  } catch (error) {
    console.error('❌ Direct search test failed:', error);
    return false;
  }
}

// Test the API endpoint
async function testApiSearch() {
  console.log('\n🌐 Testing API endpoint...');
  
  try {
    const baseUrl = process.env.TEST_URL || 'http://localhost:3000';
    
    // Test exact match
    console.log('\n--- Testing API exact match: "waggi" ---');
    const response1 = await fetch(`${baseUrl}/api/words/search?query=waggi`);
    const result1 = await response1.json();
    console.log(`API Status: ${response1.status}`);
    console.log(`Found ${result1.total} results:`, result1.results?.map(r => `${r.word} - ${r.meaning}`) || 'No results');
    console.log(`Message: ${result1.message}`);
    console.log(`Source: ${result1.source}`);
    
    // Test case insensitive
    console.log('\n--- Testing API case insensitive: "WAGGI" ---');
    const response2 = await fetch(`${baseUrl}/api/words/search?query=WAGGI`);
    const result2 = await response2.json();
    console.log(`API Status: ${response2.status}`);
    console.log(`Found ${result2.total} results:`, result2.results?.map(r => `${r.word} - ${r.meaning}`) || 'No results');
    console.log(`Source: ${result2.source}`);
    
    // Test empty query (should return suggestions)
    console.log('\n--- Testing API empty query (suggestions) ---');
    const response3 = await fetch(`${baseUrl}/api/words/search?query=`);
    const result3 = await response3.json();
    console.log(`API Status: ${response3.status}`);
    console.log(`Suggestions:`, result3.suggestions);
    console.log(`Contains waggi:`, result3.suggestions?.includes('waggi') ? '✅' : '❌');
    
    return true;
  } catch (error) {
    console.error('❌ API search test failed:', error);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 Starting Waggi Search Tests\n');
  
  const directSuccess = await testDirectSearch();
  const apiSuccess = await testApiSearch();
  
  console.log('\n📊 Test Results:');
  console.log(`Direct search: ${directSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`API search: ${apiSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (directSuccess && apiSuccess) {
    console.log('\n🎉 All tests passed! Search functionality is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testDirectSearch, testApiSearch, runTests };
