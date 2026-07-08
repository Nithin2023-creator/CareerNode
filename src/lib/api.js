const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const jsonHeaders = { 'Content-Type': 'application/json' };

const getAuthHeaders = (extraHeaders = {}) => {
  const headers = { ...extraHeaders };
  const token = localStorage.getItem('cn_token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export const createApiClient = (baseUrl) => {
  async function request(path, options = {}) {
    const { unwrap = true, ...fetchOptions } = options;
    let response;
    try {
      const headers = getAuthHeaders(fetchOptions.headers);
      response = await fetch(`${baseUrl}${path}`, { ...fetchOptions, headers });
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

    if (!unwrap) return payload;
    return payload?.data ?? payload;
  }

  return {
    request,
    get: (path, options) => request(path, options),
    postJson: (path, body, options) =>
      request(path, { method: 'POST', headers: jsonHeaders, body: JSON.stringify(body), ...options }),
    patchJson: (path, body, options) =>
      request(path, {
        method: 'PATCH',
        headers: jsonHeaders,
        body: JSON.stringify(body || {}),
        ...options,
      }),
    postForm: (path, formData, options) =>
      request(path, { method: 'POST', body: formData, ...options }),
    del: (path, options) => request(path, { method: 'DELETE', ...options }),
    put: (path, body, options) =>
      request(path, { method: 'PUT', headers: jsonHeaders, body: JSON.stringify(body), ...options }),
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
  me: () => api.get('/auth/me'),
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
};

export const gmailConnectionApi = {
  getStatus: () => api.get('/gmail-connection'),
  connect: (code) => api.postJson('/gmail-connection', { code }),
  disconnect: () => api.del('/gmail-connection'),
  testConnection: () => api.postJson('/gmail-connection/test', {}),
};

// Wallet endpoints on the main backend
export const walletApi = {
  getWallet: () => api.get('/wallet'),
  getPacks: () => api.get('/wallet/packs'),
  purchasePack: (packId) => api.postJson('/wallet/purchase', { packId }),
  getOrderStatus: (orderId) => api.get(`/wallet/orders/${orderId}`),
};

// Membership endpoints
export const membershipApi = {
  getPlans: () => api.get('/membership/plans'),
  getMe: () => api.get('/membership/me'),
  subscribe: (planId) => api.postJson('/membership/subscribe', { planId }),
  cancel: () => api.postJson('/membership/cancel', {}),
};

// Bundles endpoints on the main backend
export const bundlesApi = {
  listBundles: () => api.get('/bundles'),
  getBundle: (id) => api.get(`/bundles/${id}`),
  listPurchasedBundles: () => api.get('/bundles/purchased'),
  getBundleRecipients: (id) => api.get(`/bundles/${id}/recipients`),
  purchaseBundle: (id, paymentMethod) => api.postJson(`/bundles/${id}/purchase`, { paymentMethod }),
  getOrderStatus: (orderId) => api.get(`/bundles/orders/${orderId}`),
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
  // Marketplace & Checkout (main backend)
  listMarketplaceCompanies: () => api.get('/marketplace/companies'),
  checkout: (cartItems, paymentMethod) => api.postJson('/subscriptions/checkout', { cartItems, paymentMethod }),
  getOrderStatus: (orderId) => api.get(`/subscriptions/orders/${orderId}`),

  // Subscriptions (main backend)
  listSubscriptions: () => api.get('/subscriptions'),
  getSubscription: (id) => api.get(`/subscriptions/${id}`),
  renewSubscription: (id) => jobFinderClient.postJson(`/subscriptions/${id}/renew`),
  cancelSubscription: (id) => jobFinderClient.postJson(`/subscriptions/${id}/cancel`),

  // Notifications (stub API until migrated)
  listNotifications: () => jobFinderClient.get('/notifications'),
  markNotificationRead: (id) => jobFinderClient.postJson(`/notifications/${id}/read`),

  toggleBookmark: (subId, jobId) => jobFinderClient.postJson(`/subscriptions/${subId}/jobs/${jobId}/bookmark`),
  getSettings: () => jobFinderClient.get('/settings'),
  updateSettings: (body) => jobFinderClient.put('/settings', body),
};

// Admin Endpoints
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  listCompanies: () => api.get('/admin/companies'),
  createCompany: (body) => api.postJson('/admin/companies', body),
  updateCompany: (id, body) => api.patchJson(`/admin/companies/${id}`, body),
  deleteCompany: (id) => api.del(`/admin/companies/${id}`),
  scrapeCompany: (id) => api.postJson(`/admin/companies/${id}/scrape`, {}),

  listBundles: () => api.get('/admin/bundles'),
  createBundle: (body) => api.postJson('/admin/bundles', body),
  updateBundle: (id, body) => api.patchJson(`/admin/bundles/${id}`, body),
  deleteBundle: (id) => api.del(`/admin/bundles/${id}`),
  uploadBundleContacts: (id, contacts) => api.postJson(`/admin/bundles/${id}/upload-contacts`, { contacts }),

  listCreditPacks: () => api.get('/admin/credit-packs'),
  createCreditPack: (body) => api.postJson('/admin/credit-packs', body),
  updateCreditPack: (id, body) => api.patchJson(`/admin/credit-packs/${id}`, body),
  deleteCreditPack: (id) => api.del(`/admin/credit-packs/${id}`),

  listUsers: () => api.get('/admin/users'),
  toggleAdmin: (id) => api.patchJson(`/admin/users/${id}/toggle-admin`, {}),

  listWaitlist: () => api.get('/admin/waitlist'),
  listTransactions: () => api.get('/admin/transactions'),
  
  listMembershipPlans: () => api.get('/admin/membership-plans'),
  createMembershipPlan: (body) => api.postJson('/admin/membership-plans', body),
  updateMembershipPlan: (id, body) => api.patchJson(`/admin/membership-plans/${id}`, body),
  deleteMembershipPlan: (id) => api.del(`/admin/membership-plans/${id}`),
};

// Resume Maker Endpoints
// unwrap:false — resume documents have a `data` field; generic unwrap would strip _id/title.
export const resumeApi = {
  list: () => api.get('/resumes'),
  get: (id) => api.get(`/resumes/${id}`, { unwrap: false }),
  create: (body) => api.postJson('/resumes', body, { unwrap: false }),
  update: (id, body) => api.put(`/resumes/${id}`, body, { unwrap: false }),
  remove: (id) => api.del(`/resumes/${id}`),
  tailor: (formData) => api.postForm('/resumes/tailor', formData),
  score: (body) => api.postJson('/resumes/score', body),
  export: (body) => api.postJson('/resumes/exports', body),
};

// Unified pricing / paywall endpoints for flat-priced credit actions
export const pricingApi = {
  getCatalog: () => api.get('/pricing'),
  checkoutAction: (actionId) => api.postJson(`/pricing/${actionId}/checkout`, {}),
};
