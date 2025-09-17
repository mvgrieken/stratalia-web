#!/usr/bin/env ts-node

/**
 * POST-REFACTOR FIX SCRIPT
 * Fixes all identified issues from the systematic analysis
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface Fix {
  id: string;
  description: string;
  category: 'CRITICAL' | 'WARNING' | 'CLEANUP';
  files: string[];
  apply: () => void;
}

const fixes: Fix[] = [
  {
    id: 'fix-test-imports',
    description: 'Update test imports to use new service exports',
    category: 'CRITICAL',
    files: [
      'src/__tests__/services/QuizService.test.ts',
      'src/__tests__/services/WordService.test.ts',
      'src/__tests__/lib/mock-data.test.ts'
    ],
    apply: () => {
      console.log('🔧 Fixing test imports...');
      
      // Fix QuizService test
      const quizTestPath = 'src/__tests__/services/QuizService.test.ts';
      if (existsSync(quizTestPath)) {
        let quizTestContent = readFileSync(quizTestPath, 'utf8');
        quizTestContent = quizTestContent.replace(
          /import.*QuizService.*from.*@\/services\/QuizService.*/g,
          'import { quizService } from \'@/services/QuizService\';'
        );
        quizTestContent = quizTestContent.replace(
          /import.*mockDataService.*from.*@\/lib\/mock-data.*/g,
          'import { mockDataService } from \'@/lib/mock-data\';'
        );
        writeFileSync(quizTestPath, quizTestContent);
      }
      
      // Fix WordService test
      const wordTestPath = 'src/__tests__/services/WordService.test.ts';
      if (existsSync(wordTestPath)) {
        let wordTestContent = readFileSync(wordTestPath, 'utf8');
        wordTestContent = wordTestContent.replace(
          /import.*WordService.*from.*@\/services\/WordService.*/g,
          'import { wordService } from \'@/services/WordService\';'
        );
        wordTestContent = wordTestContent.replace(
          /import.*mockDataService.*from.*@\/lib\/mock-data.*/g,
          'import { mockDataService } from \'@/lib/mock-data\';'
        );
        writeFileSync(wordTestPath, wordTestContent);
      }
      
      console.log('✅ Test imports fixed');
    }
  },
  
  {
    id: 'fix-rate-limit-tests',
    description: 'Update rate limiter mock objects in tests',
    category: 'CRITICAL',
    files: [
      'src/__tests__/api/ai-translate.test.ts',
      'src/__tests__/api/quiz.test.ts',
      'src/__tests__/api/words-search.test.ts'
    ],
    apply: () => {
      console.log('🔧 Fixing rate limiter tests...');
      
      const testFiles = [
        'src/__tests__/api/ai-translate.test.ts',
        'src/__tests__/api/quiz.test.ts', 
        'src/__tests__/api/words-search.test.ts'
      ];
      
      testFiles.forEach(filePath => {
        if (existsSync(filePath)) {
          let content = readFileSync(filePath, 'utf8');
          
          // Fix rate limiter mock objects - add missing properties
          content = content.replace(
            /{\s*allowed:\s*true,?\s*}/g,
            '{ allowed: true, remaining: 100, resetTime: Date.now() + 3600000 }'
          );
          
          content = content.replace(
            /{\s*allowed:\s*false,?\s*}/g,
            '{ allowed: false, remaining: 0, resetTime: Date.now() + 3600000 }'
          );
          
          // Fix match_type in search tests
          content = content.replace(
            /match_type:\s*['"]exact['"]/g,
            'match_type: \'exact\' as const'
          );
          
          writeFileSync(filePath, content);
        }
      });
      
      console.log('✅ Rate limiter tests fixed');
    }
  },
  
  {
    id: 'fix-api-route-tests',
    description: 'Fix API route test imports and exports',
    category: 'CRITICAL',
    files: ['src/__tests__/api/quiz.test.ts'],
    apply: () => {
      console.log('🔧 Fixing API route tests...');
      
      const quizTestPath = 'src/__tests__/api/quiz.test.ts';
      if (existsSync(quizTestPath)) {
        let content = readFileSync(quizTestPath, 'utf8');
        
        // Fix POST import - should import from submit route
        content = content.replace(
          /import.*POST.*from.*@\/app\/api\/quiz\/route.*/g,
          'import { POST } from \'@/app/api/quiz/submit/route\';'
        );
        
        writeFileSync(quizTestPath, content);
      }
      
      console.log('✅ API route tests fixed');
    }
  },
  
  {
    id: 'fix-deprecated-files',
    description: 'Remove or update deprecated test files',
    category: 'CLEANUP',
    files: ['src/__tests__/search.e2e.test.tsx'],
    apply: () => {
      console.log('🔧 Fixing deprecated test files...');
      
      const deprecatedTestPath = 'src/__tests__/search.e2e.test.tsx';
      if (existsSync(deprecatedTestPath)) {
        let content = readFileSync(deprecatedTestPath, 'utf8');
        
        // Update import to use new SearchAndTranslate component
        content = content.replace(
          /import.*SearchClient.*from.*\.\.\/app\/search\/SearchClient.*/g,
          'import SearchAndTranslate from \'@/components/SearchAndTranslate\';'
        );
        
        // Replace SearchClient with SearchAndTranslate in tests
        content = content.replace(/SearchClient/g, 'SearchAndTranslate');
        
        // Add proper vitest imports
        content = `import { describe, it, expect, beforeEach, vi } from 'vitest';\n${content}`;
        
        writeFileSync(deprecatedTestPath, content);
      }
      
      console.log('✅ Deprecated files updated');
    }
  },
  
  {
    id: 'add-missing-env-check',
    description: 'Add environment variable validation',
    category: 'WARNING',
    files: ['src/lib/config.ts'],
    apply: () => {
      console.log('🔧 Adding environment validation...');
      
      const configPath = 'src/lib/config.ts';
      if (existsSync(configPath)) {
        let content = readFileSync(configPath, 'utf8');
        
        // Add validation function at the end
        const validationFunction = `
// Environment validation for development
export const validateEnvironment = (): { valid: boolean; missing: string[] } => {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key] || process.env[key] === 'your_' + key.toLowerCase());
  
  return {
    valid: missing.length === 0,
    missing
  };
};

// Auto-validate in development
if (process.env.NODE_ENV === 'development') {
  const validation = validateEnvironment();
  if (!validation.valid) {
    console.warn('⚠️ [CONFIG] Missing environment variables:', validation.missing);
    console.warn('⚠️ [CONFIG] Create .env.local with proper values for full functionality');
  }
}`;
        
        if (!content.includes('validateEnvironment')) {
          content += validationFunction;
          writeFileSync(configPath, content);
        }
      }
      
      console.log('✅ Environment validation added');
    }
  }
];

// Main execution
async function main() {
  console.log('🚀 Starting Post-Refactor Fix Script\n');
  
  let criticalFixed = 0;
  let warningsFixed = 0;
  let cleanupFixed = 0;
  
  for (const fix of fixes) {
    try {
      console.log(`\n📋 ${fix.id}: ${fix.description}`);
      console.log(`   Category: ${fix.category}`);
      console.log(`   Files: ${fix.files.join(', ')}`);
      
      fix.apply();
      
      switch (fix.category) {
        case 'CRITICAL': criticalFixed++; break;
        case 'WARNING': warningsFixed++; break;
        case 'CLEANUP': cleanupFixed++; break;
      }
      
    } catch (error) {
      console.error(`❌ Failed to apply fix ${fix.id}:`, error);
    }
  }
  
  console.log('\n📊 SUMMARY:');
  console.log(`✅ Critical fixes applied: ${criticalFixed}`);
  console.log(`⚠️  Warning fixes applied: ${warningsFixed}`);
  console.log(`🧹 Cleanup fixes applied: ${cleanupFixed}`);
  console.log(`\n🎉 Post-refactor fixes completed!`);
  console.log('\nNext steps:');
  console.log('1. Run: npm run typecheck');
  console.log('2. Run: npm test');
  console.log('3. Add missing environment variables to .env.local');
  console.log('4. Test the application locally');
}

if (require.main === module) {
  main().catch(console.error);
}

export { fixes };
