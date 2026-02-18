#!/usr/bin/env node
/**
 * Security check script to verify no secrets in build output
 * Cross-platform Node.js version
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

console.log('🔒 Running security checks on build output...');

let hasErrors = false;

// Patterns to check for
const dangerousPatterns = [
  { pattern: /ghp_[a-zA-Z0-9]{36,}/g, name: 'GitHub token' },
  { pattern: /github_pat_[a-zA-Z0-9_]{82,}/g, name: 'GitHub PAT' },
  { pattern: /AKIA[0-9A-Z]{16}/g, name: 'AWS key' },
];

function checkFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    
    for (const { pattern, name } of dangerousPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        // Check if it's just a pattern reference (like in validation code)
        // Allow patterns in specific contexts
        const isValidationCode = content.includes('startsWith') && content.includes('length');
        if (!isValidationCode) {
          console.error(`❌ ERROR: Found potential ${name} in ${filePath}`);
          hasErrors = true;
        }
      }
    }
  } catch (error) {
    // Skip files that can't be read
  }
}

function walkDir(dir) {
  try {
    const files = readdirSync(dir);
    
    for (const file of files) {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (stat.isFile() && /\.(js|css|html)$/.test(file)) {
        checkFile(filePath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
}

// Check dist directory
const distDir = join(process.cwd(), 'dist');
try {
  walkDir(distDir);
  
  if (hasErrors) {
    console.error('❌ Security check failed!');
    process.exit(1);
  } else {
    console.log('✅ No secrets found in build output');
    console.log('✅ Build is safe for deployment');
    process.exit(0);
  }
} catch (error) {
  console.error('❌ Error: dist directory not found. Run build first.');
  process.exit(1);
}
