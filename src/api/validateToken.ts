export const validateApiToken = async (token: string): Promise<{ valid: boolean; error?: string }> => {
  try {
    if (!token || token.trim() === '') {
      return { valid: false, error: 'API token is required' };
    }

    // Test the token with a simple API call
    const response = await fetch('https://tavusapi.com/v2/personas', {
      method: 'GET',
      headers: {
        'x-api-key': token,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      return { valid: false, error: 'Invalid API key' };
    }

    if (response.status === 429) {
      return { valid: false, error: 'API rate limit exceeded' };
    }

    if (response.status === 402) {
      return { valid: false, error: 'Insufficient credits' };
    }

    if (!response.ok) {
      const errorText = await response.text();
      return { valid: false, error: `API Error (${response.status}): ${errorText}` };
    }

    return { valid: true };
  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: false, error: 'Network error - please check your connection' };
  }
};