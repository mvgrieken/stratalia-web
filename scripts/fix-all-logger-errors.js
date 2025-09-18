#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function findAllFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  function walk(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          walk(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  walk(dir);
  return files;
}

function fixLoggerErrors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Skip logger.ts itself and layout.tsx (has special console handling)
  if (filePath.includes('lib/logger.ts') || filePath.includes('app/layout.tsx')) {
    return false;
  }
  
  // Fix malformed logger calls with syntax errors
  const fixes = [
    // Fix: logger.error(`message: ${error instanceof Error ? error : new Error(String(error})}`)
    {
      from: /logger\.(error|warn|info|debug)\(`([^`]*): \$\{([^}]*) instanceof Error \? \3 : new Error\(String\(\3\}\)\)\}\`\)/g,
      to: 'logger.$1(`$2: ${$3 instanceof Error ? $3.message : String($3)}`)'
    },
    // Fix: logger.error(`message ${error instanceof Error ? error : new Error(String(error})}`)  
    {
      from: /logger\.(error|warn|info|debug)\(`([^`]*) \$\{([^}]*) instanceof Error \? \3 : new Error\(String\(\3\}\)\)\}\`\)/g,
      to: 'logger.$1(`$2 ${$3 instanceof Error ? $3.message : String($3)}`)'
    },
    // Fix: logger.error(`message: ${variable}`))
    {
      from: /logger\.(error|warn|info|debug)\(`([^`]*): \$\{([^}]*)\}\`\)\)/g,
      to: 'logger.$1(`$2: ${$3}`)'
    },
    // Fix: logger.error(`message ${variable}`))
    {
      from: /logger\.(error|warn|info|debug)\(`([^`]*) \$\{([^}]*)\}\`\)\)/g,
      to: 'logger.$1(`$2 ${$3}`)'
    },
    // Fix double closing parens
    {
      from: /logger\.(error|warn|info|debug)\(([^)]+)\)\)/g,
      to: 'logger.$1($2)'
    }
  ];
  
  for (const fix of fixes) {
    if (fix.from.test(content)) {
      content = content.replace(fix.from, fix.to);
      changed = true;
    }
  }
  
  // Fix remaining console.* calls (except in specific files)
  if (!filePath.includes('__tests__/runtime-errors.test.ts') && 
      !filePath.includes('__tests__/unit/mutationObserver.test.ts') &&
      !filePath.includes('lib/browser-fixes.ts')) {
    
    const consoleReplacements = [
      { from: /console\.error\(/g, to: 'logger.error(' },
      { from: /console\.warn\(/g, to: 'logger.warn(' },
      { from: /console\.info\(/g, to: 'logger.info(' },
      { from: /console\.log\(/g, to: 'logger.debug(' },
      { from: /console\.debug\(/g, to: 'logger.debug(' }
    ];
    
    for (const replacement of consoleReplacements) {
      if (replacement.from.test(content)) {
        content = content.replace(replacement.from, replacement.to);
        changed = true;
      }
    }
  }
  
  // Add logger import if needed and not present
  if (changed && !/import.*logger.*from.*['"].*logger.*['"]/.test(content)) {
    const importStatement = "import { logger } from '@/lib/logger';\n";
    
    if (content.includes('import ')) {
      // Add after the last import
      const lines = content.split('\n');
      let lastImportIndex = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ') && !lines[i].includes('import type')) {
          lastImportIndex = i;
        }
      }
      
      if (lastImportIndex >= 0) {
        lines.splice(lastImportIndex + 1, 0, "import { logger } from '@/lib/logger';");
        content = lines.join('\n');
      }
    } else {
      content = importStatement + content;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

// Main execution
console.log('🚀 Fixing all logger errors systematically...');

const srcDir = path.join(process.cwd(), 'src');
const files = findAllFiles(srcDir);

console.log(`📁 Processing ${files.length} files...`);

let fixedCount = 0;
for (const file of files) {
  try {
    if (fixLoggerErrors(file)) {
      console.log(`✅ Fixed: ${path.relative(process.cwd(), file)}`);
      fixedCount++;
    }
  } catch (error) {
    console.log(`❌ Error processing ${file}:`, error.message);
  }
}

console.log(`\n✨ Fixed ${fixedCount} files total.`);
