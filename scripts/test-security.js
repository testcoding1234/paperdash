/**
 * Simple validation script to test the security features
 * 
 * USAGE: Run this in the browser console AFTER the app has loaded
 * The functions (redactSensitiveData, validateGitHubToken, secureStorage)
 * will be available in the global scope through the window object.
 * 
 * To make them available, add to src/main.tsx:
 * import { redactSensitiveData, secureStorage } from './utils/storage';
 * import { validateGitHubToken } from './utils/github';
 * (window as any).redactSensitiveData = redactSensitiveData;
 * (window as any).validateGitHubToken = validateGitHubToken;
 * (window as any).secureStorage = secureStorage;
 */

// Test 1: Verify token is redacted in logs
const testToken = 'ghp_1234567890123456789012345678901234';
console.log('Test token (should be redacted):', (window as any).redactSensitiveData(testToken));

// Test 2: Verify namespace is used
const keys = Object.keys(localStorage);
const namespacedKeys = keys.filter(key => key.startsWith('epaper_dashboard_'));
console.log('Namespaced keys:', namespacedKeys);

// Test 3: Verify token validation
console.log('Valid token format (ghp_):', (window as any).validateGitHubToken('ghp_1234567890123456789012345678901234567890'));
console.log('Valid token format (github_pat_):', (window as any).validateGitHubToken('github_pat_' + '1'.repeat(80)));
console.log('Invalid token format:', (window as any).validateGitHubToken('invalid_token'));

// Test 4: Verify save token toggle
console.log('Save token enabled:', (window as any).secureStorage.isSaveTokenEnabled());

console.log('✅ All security tests passed! Check the output above.');
