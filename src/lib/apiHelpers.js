// Wraps an API promise to return mock data if the API fails (e.g. backend not running)
export const withMockFallback = async (apiPromise, mockValue) => {
  try {
    return await apiPromise;
  } catch (error) {
    console.warn('API request failed, returning mock data fallback.', error);
    return mockValue;
  }
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};
