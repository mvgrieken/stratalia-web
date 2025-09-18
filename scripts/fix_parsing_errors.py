#!/usr/bin/env python3

import os
import re
import glob

def fix_parsing_errors():
    """Fix all parsing errors in logger calls systematically."""
    
    # Find all TypeScript files
    files = []
    for pattern in ['src/**/*.ts', 'src/**/*.tsx']:
        files.extend(glob.glob(pattern, recursive=True))
    
    print(f"🔧 Processing {len(files)} files...")
    
    fixed_count = 0
    
    for file_path in files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Fix pattern: logger.error(`message: ${error instanceof Error ? error : new Error(String(error}`);
            content = re.sub(
                r'logger\.(error|warn|info|debug)\(`([^`]*): \$\{([^}]*) instanceof Error \? \3 : new Error\(String\(\3\}`\);',
                r'logger.\1(`\2: ${\3 instanceof Error ? \3.message : String(\3)}`);',
                content
            )
            
            # Fix pattern: logger.error(`message ${error instanceof Error ? error : new Error(String(error}`);
            content = re.sub(
                r'logger\.(error|warn|info|debug)\(`([^`]*) \$\{([^}]*) instanceof Error \? \3 : new Error\(String\(\3\}`\);',
                r'logger.\1(`\2 ${\3 instanceof Error ? \3.message : String(\3)}`);',
                content
            )
            
            # Fix ErrorBoundary pattern
            content = re.sub(
                r'logger\.error\(`ErrorBoundary caught an error: \$\{error, errorInfo\}`\);',
                r'logger.error(`ErrorBoundary caught an error: ${error}, ${errorInfo}`);',
                content
            )
            
            # Fix LazyPageWrapper pattern  
            content = re.sub(
                r'logger\.error\(`Lazy component error: \$\{error, errorInfo\}`\);',
                r'logger.error(`Lazy component error: ${error}, ${errorInfo}`);',
                content
            )
            
            # Fix usePerformance pattern
            content = re.sub(
                r'logger\.debug\(`\[Performance\] \$\{name\}: \$\{value\}ms \$\{id \? `\(\$\{id\}\)` : ""\}`\);',
                r'logger.debug(`[Performance] ${name}: ${value}ms ${id ? `(${id})` : ""}`);',
                content
            )
            
            # Fix test patterns with expect calls
            content = re.sub(
                r'expect\(logger\.(error|warn|info|debug)\)\)\.toHaveBeenCalledWith\(`([^`]*)`\);',
                r'expect(logger.\1).toHaveBeenCalledWith(`\2`);',
                content
            )
            
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ Fixed: {file_path}")
                fixed_count += 1
                
        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
    
    print(f"\n✨ Fixed {fixed_count} files with parsing errors.")

if __name__ == '__main__':
    fix_parsing_errors()
