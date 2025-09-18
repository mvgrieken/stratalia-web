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
  
  // Create a map of error variable names to their actual names
  const errorVarMap = new Map();
  
  // Find all destructuring patterns and variable declarations
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for destructuring patterns like: const { data, error: someError } = ...
    const destructuringMatch = line.match(/const\s*{\s*[^}]*error:\s*(\w+)[^}]*}/);
    if (destructuringMatch) {
      errorVarMap.set('error', destructuringMatch[1]);
    }
    
    // Look for variable declarations like: const someError = ...
    const varMatch = line.match(/const\s+(\w*[Ee]rror\w*)\s*=/);
    if (varMatch) {
      const varName = varMatch[1];
      if (varName.toLowerCase().includes('error')) {
        errorVarMap.set('error', varName);
      }
    }
  }
  
  // Now fix all instances of generic 'error' in logger calls
  const errorPattern = /error instanceof Error \? error\.message : String\(error\)/g;
  
  if (errorPattern.test(content)) {
    // Get the most common error variable name from the map
    const actualErrorVar = errorVarMap.get('error') || 'error';
    
    // Replace all instances
    const newContent = content.replace(errorPattern, `${actualErrorVar} instanceof Error ? ${actualErrorVar}.message : String(${actualErrorVar})`);
    
    if (newContent !== content) {
      content = newContent;
      modified = true;
      totalFixed++;
    }
  }
  
  if (modified) {
    fs.writeFileSync(file, content);
    console.log(`✅ Fixed ${file}`);
  }
});

console.log(`\n🎉 Total fixes applied: ${totalFixed}`);
