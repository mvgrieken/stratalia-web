#!/usr/bin/env node

/**
 * Advanced codemod to fix all logging issues systematically
 */

const fs = require('fs');
const path = require('path');

function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
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

function fixLoggerCalls(content) {
  let result = content;
  let changed = false;

  // Fix pattern: logger.error('message:', variable) -> logger.error(`message: ${variable}`)
  const patterns = [
    // Error with error object handling
    {
      from: /logger\.(error|warn|info|debug)\(\s*(['"`])([^'"`]*?):\s*\2,\s*([^)]+?)\s*\)/g,
      to: (match, method, quote, message, variable) => {
        // Clean up the variable - remove instanceof Error checks that are already there
        let cleanVar = variable.trim();
        if (cleanVar.includes('instanceof Error ? ') && cleanVar.includes(' : new Error(String(')) {
          // Already properly handled, just use as is
          return `logger.${method}(\`${message}: \${${cleanVar}}\`)`;
        } else if (cleanVar.toLowerCase().includes('error')) {
          // Add error handling
          return `logger.${method}(\`${message}: \${${cleanVar} instanceof Error ? ${cleanVar}.message : String(${cleanVar})}\`)`;
        } else {
          return `logger.${method}(\`${message}: \${${cleanVar}}\`)`;
        }
      }
    },
    // Simple message with variable
    {
      from: /logger\.(error|warn|info|debug)\(\s*(['"`])([^'"`]*?)\s*\2,\s*([^)]+?)\s*\)/g,
      to: (match, method, quote, message, variable) => {
        let cleanVar = variable.trim();
        if (cleanVar.includes('instanceof Error ? ') && cleanVar.includes(' : new Error(String(')) {
          return `logger.${method}(\`${message} \${${cleanVar}}\`)`;
        } else if (cleanVar.toLowerCase().includes('error')) {
          return `logger.${method}(\`${message} \${${cleanVar} instanceof Error ? ${cleanVar}.message : String(${cleanVar})}\`)`;
        } else {
          return `logger.${method}(\`${message} \${${cleanVar}}\`)`;
        }
      }
    }
  ];

  for (const pattern of patterns) {
    if (pattern.from.test(result)) {
      result = result.replace(pattern.from, pattern.to);
      changed = true;
    }
  }

  return { content: result, changed };
}

function fixConsoleToLogger(content) {
  let result = content;
  let changed = false;

  // Skip files that should keep console
  if (content.includes('_originalError = console.error') || 
      content.includes('console.error = function') ||
      content.includes('lib/logger.ts')) {
    return { content: result, changed: false };
  }

  const replacements = [
    { from: /console\.error\(/g, to: 'logger.error(' },
    { from: /console\.warn\(/g, to: 'logger.warn(' },
    { from: /console\.info\(/g, to: 'logger.info(' },
    { from: /console\.log\(/g, to: 'logger.debug(' },
    { from: /console\.debug\(/g, to: 'logger.debug(' }
  ];

  for (const replacement of replacements) {
    if (replacement.from.test(result)) {
      result = result.replace(replacement.from, replacement.to);
      changed = true;
    }
  }

  return { content: result, changed };
}

function addLoggerImport(content, filePath) {
  // Skip if already has logger import or is the logger file itself
  if (content.includes("from '@/lib/logger'") || 
      content.includes('from "../lib/logger"') ||
      filePath.includes('lib/logger.ts')) {
    return { content, changed: false };
  }

  // Only add if logger is used
  if (!/logger\.(error|warn|info|debug|trace)/.test(content)) {
    return { content, changed: false };
  }

  const importStatement = "import { logger } from '@/lib/logger';\n";
  
  // Find where to insert the import
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
      return { content: lines.join('\n'), changed: true };
    }
  }
  
  // Fallback: add at the top
  return { content: importStatement + content, changed: true };
}

function fixFile(filePath) {
  console.log(`🔧 Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let totalChanged = false;
  
  // Step 1: Fix console to logger
  const consoleResult = fixConsoleToLogger(content);
  content = consoleResult.content;
  if (consoleResult.changed) totalChanged = true;
  
  // Step 2: Fix logger calls with multiple arguments
  const loggerResult = fixLoggerCalls(content);
  content = loggerResult.content;
  if (loggerResult.changed) totalChanged = true;
  
  // Step 3: Add logger import if needed
  const importResult = addLoggerImport(content, filePath);
  content = importResult.content;
  if (importResult.changed) totalChanged = true;
  
  if (totalChanged) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main execution
const srcDir = path.join(process.cwd(), 'src');
console.log('🚀 Starting advanced logging fixes...');

const files = findFiles(srcDir);
console.log(`📁 Found ${files.length} files to process`);

let fixedCount = 0;
for (const file of files) {
  if (fixFile(file)) {
    fixedCount++;
  }
}

console.log(`\n✨ Completed! Fixed ${fixedCount} files out of ${files.length} processed.`);
