#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript files in src/app/api
const files = glob.sync('src/app/api/**/*.ts');

let totalFixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Pattern to match: error instanceof Error ? error.message : String(error)
  // But we need to find the actual error variable name from the context
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for the pattern with generic 'error' variable
    if (line.includes('error instanceof Error ? error.message : String(error)')) {
      // Look backwards to find the actual error variable name
      let errorVarName = null;
      
      // Check previous lines for destructuring patterns like: const { data, error: someError } = ...
      for (let j = Math.max(0, i - 10); j < i; j++) {
        const prevLine = lines[j];
        const match = prevLine.match(/error:\s*(\w+)/);
        if (match) {
          errorVarName = match[1];
          break;
        }
      }
      
      if (errorVarName && errorVarName !== 'error') {
        // Replace the generic 'error' with the actual variable name
        const newLine = line.replace(
          'error instanceof Error ? error.message : String(error)',
          `${errorVarName} instanceof Error ? ${errorVarName}.message : String(${errorVarName})`
        );
        lines[i] = newLine;
        modified = true;
        totalFixed++;
        console.log(`Fixed ${file}:${i + 1} - replaced 'error' with '${errorVarName}'`);
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(file, lines.join('\n'));
  }
});

console.log(`\nTotal fixes applied: ${totalFixed}`);
