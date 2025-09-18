#!/usr/bin/env node

/**
 * Codemod to fix logging issues:
 * 1. Replace console.* with logger.*
 * 2. Fix logger calls with multiple arguments to use string interpolation
 * 3. Handle error objects properly
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  function walk(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, .git, .next, etc.
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

function fixFile(filePath) {
  console.log(`🔧 Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Skip logger.ts itself
  if (filePath.includes('lib/logger.ts')) {
    return false;
  }
  
  // Add logger import if not present and we're using logger
  const hasLoggerUsage = /logger\.(error|warn|info|debug|trace)/.test(content);
  const hasLoggerImport = /import.*logger.*from.*['"].*logger.*['"]/.test(content);
  
  if (hasLoggerUsage && !hasLoggerImport) {
    // Add logger import at the top
    const importStatement = "import { logger } from '@/lib/logger';\n";
    
    // Find the right place to insert the import
    if (content.includes("import")) {
      content = content.replace(/(import[^;]+;)\n/, `$1\n${importStatement}`);
    } else {
      content = importStatement + content;
    }
    changed = true;
  }
  
  // Replace console.* with logger.*
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
  
  // Fix logger calls with multiple arguments
  // Pattern: logger.method('message', variable) -> logger.method(\`message \${variable}\`)
  const loggerCallPatterns = [
    // logger.error('message:', error) -> logger.error(\`message: \${error instanceof Error ? error.message : String(error)}\`)
    {
      from: /logger\.(error|warn|info|debug)\(\s*(['"`])([^'"`]*?):\s*\2,\s*([^)]+)\)/g,
      to: (match, method, quote, message, variable) => {
        if (variable.includes('instanceof Error')) {
          return `logger.${method}(\`${message}: \${${variable}}\`)`;
        } else if (variable.includes('Error') || variable.includes('error')) {
          return `logger.${method}(\`${message}: \${${variable} instanceof Error ? ${variable}.message : String(${variable})}\`)`;
        } else {
          return `logger.${method}(\`${message}: \${${variable}}\`)`;
        }
      }
    },
    // logger.error('message', variable) -> logger.error(\`message \${variable}\`)
    {
      from: /logger\.(error|warn|info|debug)\(\s*(['"`])([^'"`]*?)\s*\2,\s*([^)]+)\)/g,
      to: (match, method, quote, message, variable) => {
        if (variable.includes('instanceof Error')) {
          return `logger.${method}(\`${message} \${${variable}}\`)`;
        } else if (variable.includes('Error') || variable.includes('error')) {
          return `logger.${method}(\`${message} \${${variable} instanceof Error ? ${variable}.message : String(${variable})}\`)`;
        } else {
          return `logger.${method}(\`${message} \${${variable}}\`)`;
        }
      }
    }
  ];
  
  for (const pattern of loggerCallPatterns) {
    if (pattern.from.test(content)) {
      content = content.replace(pattern.from, pattern.to);
      changed = true;
    }
  }
  
  // Handle specific cases for error logging with proper error handling
  const errorPatterns = [
    // Fix the pattern: logger.error('message:', error instanceof Error ? error : new Error(String(error)))
    {
      from: /logger\.error\(\s*(['"`])([^'"`]*?):\s*\1,\s*([^)]*?instanceof Error[^)]*?)\)/g,
      to: (match, quote, message, errorExpr) => `logger.error(\`${message}: \${${errorExpr}}\`)`
    }
  ];
  
  for (const pattern of errorPatterns) {
    if (pattern.from.test(content)) {
      content = content.replace(pattern.from, pattern.to);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main execution
const srcDir = path.join(process.cwd(), 'src');
console.log('🚀 Starting logging fixes...');

const files = findFiles(srcDir);
console.log(`📁 Found ${files.length} files to process`);

let fixedCount = 0;
for (const file of files) {
  if (fixFile(file)) {
    fixedCount++;
  }
}

console.log(`\n✨ Completed! Fixed ${fixedCount} files out of ${files.length} processed.`);
