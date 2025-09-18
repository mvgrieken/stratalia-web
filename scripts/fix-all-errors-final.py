#!/usr/bin/env python3

import os
import re
import glob

def fix_error_variables():
    # Find all TypeScript files in src/app/api
    files = glob.glob('src/app/api/**/*.ts', recursive=True)
    
    total_fixed = 0
    
    for file_path in files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Fix all instances of generic 'error' in logger calls
            # Pattern: error instanceof Error ? error.message : String(error)
            pattern = r'error instanceof Error \? error\.message : String\(error\)'
            replacement = r'error instanceof Error ? error.message : String(error)'
            
            new_content = re.sub(pattern, replacement, content)
            
            if new_content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'✅ Fixed {file_path}')
                total_fixed += 1
            
        except Exception as e:
            print(f'❌ Error processing {file_path}: {e}')
    
    print(f'\n🎉 Total fixes applied: {total_fixed}')

if __name__ == '__main__':
    fix_error_variables()
