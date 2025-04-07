/**
 * Helper functions for safely accessing environment variables client-side
 */

// Get client environment variables
export const clientEnv = {
  // LinkedIn OAuth
  linkedInClientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || '',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  
  // Add other client-side environment variables here
  // ...
};

// Check if client environment variables are properly set
export function validateClientEnv() {
  const requiredVars = [
    { name: 'linkedInClientId', value: clientEnv.linkedInClientId },
    { name: 'baseUrl', value: clientEnv.baseUrl },
  ];
  
  const missingVars = requiredVars.filter(v => !v.value);
  
  if (missingVars.length > 0) {
    console.error('Missing required client environment variables:', 
      missingVars.map(v => v.name).join(', ')
    );
    return false;
  }
  
  return true;
}

// Export default for convenience
export default clientEnv; 