#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Files with parsing errors that need fixing
const filesToFix = [
  'src/app/api/admin/crawl-content/route.ts',
  'src/app/api/admin/moderate-content/route.ts', 
  'src/app/api/admin/monitoring/route.ts',
  'src/app/api/admin/refresh-knowledge/route.ts',
  'src/app/api/admin/users/route.ts',
  'src/app/api/content/approved/[id]/route.ts',
  'src/app/api/profile/points/route.ts',
  'src/app/api/profile/submissions/route.ts',
  'src/app/api/words/search/route.ts',
  'src/app/auth/callback/page.tsx',
  'src/components/ErrorBoundary.tsx',
  'src/components/ErrorBoundary/ErrorBoundary.tsx',
  'src/components/LazyPageWrapper.tsx',
  'src/components/auth/AppleAuthButton.tsx',
  'src/components/auth/GoogleAuthButton.tsx',
  'src/components/auth/PinLoginForm.tsx',
  'src/hooks/usePerformance.ts',
  'src/lib/cache/CacheDecorator.ts',
  'src/lib/cache/QueryCache.ts',
  'src/lib/database/IndexManager.ts',
  'src/lib/database/TransactionManager.ts',
  'src/lib/events.ts',
  'src/lib/migrations.ts',
  'src/lib/monitoring.ts',
  'src/lib/supabase-helpers.ts',
  'src/middleware/PerformanceMiddleware.ts',
  'src/repositories/WordRepository.ts',
  'src/services/QuizService.ts'
];

function fixFile(filePath) {
  console.log(`🔧 Fixing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Fix common parsing errors from bad string interpolation
  const fixes = [
    // Fix missing closing parenthesis in error handling
    {
      from: /contentError instanceof Error \? contentError : new Error\(String\(contentError\}\)\)\)/g,
      to: 'contentError instanceof Error ? contentError.message : String(contentError)'
    },
    // Fix missing closing parenthesis in other error patterns  
    {
      from: /error instanceof Error \? error : new Error\(String\(error\}\)\)\)/g,
      to: 'error instanceof Error ? error.message : String(error)'
    },
    // Fix template literal syntax errors
    {
      from: /\$\{([^}]+)\}\)\)/g,
      to: '${$1}'
    },
    // Fix double closing parens
    {
      from: /\}\)\)\)/g,
      to: '}'
    },
    // Fix malformed logger calls with template literals
    {
      from: /logger\.(error|warn|info|debug)\(`([^`]*)\$\{([^}]*)\}\)\)/g,
      to: 'logger.$1(`$2${$3}`)'
    },
    // Fix console.error with object syntax that got mangled
    {
      from: /logger\.(error|warn|info|debug)\(`([^`]*): \$\{([^}]*)\}\)\)/g,
      to: 'logger.$1(`$2: ${$3}`)'
    }
  ];
  
  for (const fix of fixes) {
    if (fix.from.test(content)) {
      content = content.replace(fix.from, fix.to);
      changed = true;
    }
  }
  
  // Additional manual fixes for specific patterns
  
  // Fix ErrorBoundary.tsx pattern
  if (filePath.includes('ErrorBoundary.tsx')) {
    content = content.replace(
      /logger\.error\(`ErrorBoundary caught an error: \$\{error\}, \$\{errorInfo\}\)\)/g,
      'logger.error(`ErrorBoundary caught an error: ${error}, ${errorInfo}`)'
    );
    changed = true;
  }
  
  // Fix LazyPageWrapper.tsx pattern  
  if (filePath.includes('LazyPageWrapper.tsx')) {
    content = content.replace(
      /logger\.error\(`Lazy component error: \$\{error\}, \$\{errorInfo\}\)\)/g,
      'logger.error(`Lazy component error: ${error}, ${errorInfo}`)'
    );
    changed = true;
  }
  
  // Fix usePerformance.ts pattern
  if (filePath.includes('usePerformance.ts')) {
    content = content.replace(
      /logger\.debug\(`\[Performance\] \$\{name\}: \$\{value\}ms \$\{id \? `\(\$\{id\}\)` : ''}\)\)/g,
      'logger.debug(`[Performance] ${name}: ${value}ms ${id ? `(${id})` : ""}`)'
    );
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

console.log('🚀 Fixing parsing errors...');

let fixedCount = 0;
for (const file of filesToFix) {
  try {
    if (fixFile(file)) {
      fixedCount++;
    }
  } catch (error) {
    console.log(`❌ Error fixing ${file}:`, error.message);
  }
}

console.log(`\n✨ Fixed ${fixedCount} files with parsing errors.`);
