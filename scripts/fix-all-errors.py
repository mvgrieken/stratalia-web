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
            
            # Find all destructuring patterns and variable declarations
            error_var_map = {}
            
            # Look for destructuring patterns like: const { data, error: someError } = ...
            destructuring_matches = re.findall(r'const\s*{\s*[^}]*error:\s*(\w+)[^}]*}', content)
            if destructuring_matches:
                error_var_map['error'] = destructuring_matches[0]
            
            # Look for variable declarations like: const someError = ...
            var_matches = re.findall(r'const\s+(\w*[Ee]rror\w*)\s*=', content)
            if var_matches:
                for var_name in var_matches:
                    if 'error' in var_name.lower():
                        error_var_map['error'] = var_name
                        break
            
            # Get the actual error variable name
            actual_error_var = error_var_map.get('error', 'error')
            
            # Fix all instances of generic 'error' in logger calls
            pattern = r'error instanceof Error \? error\.message : String\(error\)'
            replacement = f'{actual_error_var} instanceof Error ? {actual_error_var}.message : String({actual_error_var})'
            
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
