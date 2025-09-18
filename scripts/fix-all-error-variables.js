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
  
  // Pattern 1: Fix generic 'error' variables in logger calls
  // Look for: error instanceof Error ? error.message : String(error)
  // and replace with the actual error variable name from context
  
  // First, find all destructuring patterns to map error variables
  const destructuringMatches = content.match(/const\s*{\s*[^}]*error:\s*(\w+)[^}]*}/g);
  const errorVarMap = new Map();
  
  if (destructuringMatches) {
    destructuringMatches.forEach(match => {
      const varMatch = match.match(/error:\s*(\w+)/);
      if (varMatch) {
        const actualVarName = varMatch[1];
        errorVarMap.set('error', actualVarName);
      }
    });
  }
  
  // Pattern 2: Fix all instances of generic 'error' in logger calls
  const errorPattern = /error instanceof Error \? error\.message : String\(error\)/g;
  if (errorPattern.test(content)) {
    // Find the actual error variable name from the surrounding context
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('error instanceof Error ? error.message : String(error)')) {
        // Look backwards to find the actual error variable name
        let errorVarName = null;
        
        // Check previous lines for destructuring patterns
        for (let j = Math.max(0, i - 10); j < i; j++) {
          const prevLine = lines[j];
          
          // Look for destructuring patterns like: const { data, error: someError } = ...
          const destructuringMatch = prevLine.match(/const\s*{\s*[^}]*error:\s*(\w+)[^}]*}/);
          if (destructuringMatch) {
            errorVarName = destructuringMatch[1];
            break;
          }
          
          // Look for variable declarations like: const someError = ...
          const varMatch = prevLine.match(/const\s+(\w*[Ee]rror\w*)\s*=/);
          if (varMatch) {
            errorVarName = varMatch[1];
            break;
          }
        }
        
        if (errorVarName) {
          const oldPattern = 'error instanceof Error ? error.message : String(error)';
          const newPattern = `${errorVarName} instanceof Error ? ${errorVarName}.message : String(${errorVarName})`;
          
          content = content.replace(oldPattern, newPattern);
          modified = true;
          totalFixed++;
        }
      }
    }
  }
  
  // Pattern 3: Fix any remaining generic 'error' variables in logger calls
  // This catches cases where the error variable name is not obvious from context
  const remainingErrorPattern = /logger\.(error|warn|info|debug)\([^)]*error instanceof Error \? error\.message : String\(error\)[^)]*\)/g;
  
  if (remainingErrorPattern.test(content)) {
    // For these cases, we'll need to be more careful and look at the specific context
    // For now, let's just log them so we can fix them manually if needed
    console.log(`⚠️  Found remaining generic error variables in ${file}`);
  }
  
  if (modified) {
    fs.writeFileSync(file, content);
    console.log(`✅ Fixed ${file}`);
  }
});

console.log(`\n🎉 Total fixes applied: ${totalFixed}`);
console.log('📝 Files modified:', files.filter(file => {
  const content = fs.readFileSync(file, 'utf8');
  return content.includes('error instanceof Error ? error.message : String(error)');
}).length);
