
/**
 * Secure token management utilities
 */

import { Session } from '@supabase/supabase-js';

/**
 * Securely extracts only the necessary data from a Supabase session
 * to avoid exposing sensitive information in component state
 */
export const extractSafeSessionData = (session: Session | null) => {
  if (!session) return null;
  
  // Only extract minimal required data, avoiding storing full tokens in component state
  return {
    userId: session.user?.id,
    email: session.user?.email,
    isAuthenticated: !!session.user,
    expiresAt: session.expires_at
  };
};

/**
 * Checks if a token is about to expire and should be refreshed
 * @param expiresAt Token expiration timestamp in seconds
 * @param thresholdMinutes Minutes before expiration to trigger refresh
 */
export const shouldRefreshToken = (expiresAt?: number | null, thresholdMinutes = 5): boolean => {
  if (!expiresAt) return false;
  
  const expirationDate = new Date(expiresAt * 1000);
  const thresholdTime = new Date();
  thresholdTime.setMinutes(thresholdTime.getMinutes() + thresholdMinutes);
  
  return expirationDate < thresholdTime;
};

/**
 * Sanitizes JWT token for safe logging (shows only first 8 chars)
 * Useful for debugging authentication issues
 */
export const sanitizeTokenForLogging = (token: string | undefined): string => {
  if (!token) return 'no-token';
  if (token.length <= 12) return '***';
  
  return `${token.substring(0, 8)}...`;
};

/**
 * Removes auth tokens from localStorage/sessionStorage when not using Supabase's
 * built-in storage to prevent token exposure
 */
export const clearExposedTokens = (): void => {
  // Check for potential token leakage in localStorage/sessionStorage
  const storageKeys = [
    'access_token', 'auth_token', 'jwt', 'token', 
    'supabase.auth.token', 'sb-access-token', 'sb-refresh-token'
  ];
  
  storageKeys.forEach(key => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (e) {
      // Silently fail for storage access issues
      console.debug('Unable to check storage for token:', key);
    }
  });
};

/**
 * Refresh authentication token if it's nearing expiration
 * @param session Current session
 * @param refreshFunction Function to call to refresh the token
 * @param thresholdMinutes Minutes before expiration to trigger refresh
 */
export const refreshTokenIfNeeded = async (
  session: Session | null,
  refreshFunction: () => Promise<void>,
  thresholdMinutes = 5
): Promise<void> => {
  if (!session) return;
  
  try {
    if (shouldRefreshToken(session.expires_at, thresholdMinutes)) {
      console.debug('Token refresh needed, refreshing...');
      await refreshFunction();
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }
};

/**
 * Verify the integrity of an authentication token
 * @param token The token to verify
 * @returns Boolean indicating if the token passes basic integrity checks
 */
export const verifyTokenIntegrity = (token?: string | null): boolean => {
  if (!token) return false;
  
  try {
    // Basic JWT structure validation (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Each part should be base64url encoded
    const validBase64url = parts.every(part => 
      /^[A-Za-z0-9_-]+$/.test(part)
    );
    
    return validBase64url;
  } catch (e) {
    console.error('Token integrity check failed:', e);
    return false;
  }
};
