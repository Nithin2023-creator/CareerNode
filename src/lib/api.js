const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const jsonHeaders = { 'Content-Type': 'application/json' };

export const createApiClient = (baseUrl) => {
  async function request(path, options = {}) {
    let response;
    try {
      response = await fetch(`${baseUrl}${path}`, options);
    } catch {
      throw new Error('Cannot reach the server. Is the backend running?');
    }

    if (response.status === 204) return null;

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const message = payload?.error || payload?.message || `Request failed (${response.status})`;
      throw new Error(message);
    }

    return payload?.data ?? payload;
  }

  return {
    get: (path) => request(path),
    postJson: (path, body) => request(path, { method: 'POST', headers: jsonHeaders, body: JSON.stringify(body) }),
    patchJson: (path, body) =>
      request(path, { method: 'PATCH', headers: jsonHeaders, body: JSON.stringify(body || {}) }),
    postForm: (path, formData) => request(path, { method: 'POST', body: formData }),
    del: (path) => request(path, { method: 'DELETE' }),
    put: (path, body) => request(path, { method: 'PUT', headers: jsonHeaders, body: JSON.stringify(body) })
  };
};

export const api = createApiClient(API_BASE_URL);

// Resolve an uploaded-file path (e.g. attachment) against the API host.
export const uploadUrl = (filename) => {
  if (!filename) return null;
  const host = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${host}/uploads/${filename}`;
};

// Authentication endpoints
export const authApi = {
  google: (token) => api.postJson('/auth/google', { token }),
  login: (body) => api.postJson('/auth/login', body),
  signup: (body) => api.postJson('/auth/signup', body),
};

// Cold mailer domain endpoints.
export const coldMailerApi = {
  listCampaigns: () => api.get('/campaigns'),
  getCampaign: (id) => api.get(`/campaigns/${id}`),
  getCampaignStatus: (id) => api.get(`/campaigns/${id}/status`),
  createCampaign: (formData) => api.postForm('/campaigns', formData),
  updateCampaign: (id, body) => api.patchJson(`/campaigns/${id}`, body),
  deleteCampaign: (id) => api.del(`/campaigns/${id}`),
  // action: 'send' | 'pause' | 'stop' | 'resume' | 'retry-failed' | 'reset'
  changeStatus: (id, action, extra = {}) => api.patchJson(`/campaigns/${id}/status`, { action, ...extra }),

  importCsv: (formData) => api.postForm('/csv-imports', formData),
  cleanRows: (rows) => api.postJson('/csv-imports/clean-rows', { rows }),

  getSmtpSettings: () => api.get('/smtp-settings'),
  testSmtpConnection: () => api.postJson('/smtp-settings/test-connection', {}),
};

// Wallet endpoints on the main backend
export const walletApi = {
  getWallet: () => api.get('/wallet'),
  getPacks: () => api.get('/wallet/packs'),
  purchasePack: (packId) => api.postJson('/wallet/purchase', { packId }),
};

// Bundles endpoints on the main backend
export const bundlesApi = {
  listBundles: () => api.get('/bundles'),
  getBundle: (id) => api.get(`/bundles/${id}`),
  listPurchasedBundles: () => api.get('/bundles/purchased'),
  getBundleRecipients: (id) => api.get(`/bundles/${id}/recipients`),
  purchaseBundle: (id, paymentMethod) => api.postJson(`/bundles/${id}/purchase`, { paymentMethod }),
};

// Waitlist endpoints
export const waitlistApi = {
  join: (body) => api.postJson('/waitlist', body),
  getCount: (tool) => api.get(`/waitlist/count?tool=${tool}`)
};

// Job Finder endpoints
export const jobFinderClient = createApiClient(
  import.meta.env.VITE_JOB_FINDER_API_BASE_URL || 'http://localhost:5002/api'
);

export const jobFinderApi = {
  // Marketplace & Checkout
  listMarketplaceCompanies: () => jobFinderClient.get('/marketplace/companies'),
  checkout: (cartItems, paymentMethod) => jobFinderClient.postJson('/checkout', { cartItems, paymentMethod }),
  
  // Wallet & Credits
  getWallet: () => jobFinderClient.get('/wallet'),
  purchaseCreditPack: (packId) => jobFinderClient.postJson('/wallet/purchase', { packId }),
  
  // Subscriptions
  listSubscriptions: () => jobFinderClient.get('/subscriptions'),
  getSubscription: (id) => jobFinderClient.get(`/subscriptions/${id}`),
  renewSubscription: (id) => jobFinderClient.postJson(`/subscriptions/${id}/renew`),
  cancelSubscription: (id) => jobFinderClient.postJson(`/subscriptions/${id}/cancel`),
  
  // Notifications
  listNotifications: () => jobFinderClient.get('/notifications'),
  markNotificationRead: (id) => jobFinderClient.postJson(`/notifications/${id}/read`),

  // Existing helpers
  toggleBookmark: (subId, jobId) => jobFinderClient.postJson(`/subscriptions/${subId}/jobs/${jobId}/bookmark`),
  getSettings: () => jobFinderClient.get('/settings'),
  updateSettings: (body) => jobFinderClient.put('/settings', body),
};
