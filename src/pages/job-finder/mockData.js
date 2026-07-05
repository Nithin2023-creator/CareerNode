import { MATCH_TIER } from './helpers';

export const mockCompanies = [
  { 
    id: 'comp-1', 
    name: 'Stripe', 
    logoUrl: 'https://logo.clearbit.com/stripe.com',
    category: 'FinTech',
    tier: 'premium',
    openRoles: 142,
    creditCost: 15,
    alaCartePrice: 19.99,
    description: 'Financial infrastructure platform for the internet.'
  },
  { 
    id: 'comp-2', 
    name: 'Vercel', 
    logoUrl: 'https://logo.clearbit.com/vercel.com',
    category: 'DevTools',
    tier: 'premium',
    openRoles: 38,
    creditCost: 15,
    alaCartePrice: 19.99,
    description: 'Platform for frontend frameworks and static sites.'
  },
  { 
    id: 'comp-3', 
    name: 'OpenAI', 
    logoUrl: 'https://logo.clearbit.com/openai.com',
    category: 'AI / ML',
    tier: 'premium',
    openRoles: 89,
    creditCost: 20,
    alaCartePrice: 24.99,
    description: 'AI research and deployment company.'
  },
  { 
    id: 'comp-4', 
    name: 'Shopify', 
    logoUrl: 'https://logo.clearbit.com/shopify.com',
    category: 'E-commerce',
    tier: 'standard',
    openRoles: 215,
    creditCost: 10,
    alaCartePrice: 14.99,
    description: 'Global commerce company providing tools to start, grow, and manage a retail business.'
  },
  { 
    id: 'comp-5', 
    name: 'Linear', 
    logoUrl: 'https://logo.clearbit.com/linear.app',
    category: 'Productivity',
    tier: 'standard',
    openRoles: 12,
    creditCost: 10,
    alaCartePrice: 14.99,
    description: 'A better way to build products. Issue tracking built for developers.'
  }
];

export const mockCreditPacks = [
  { id: 'pack-starter', name: 'Starter', credits: 20, price: 9.99 },
  { id: 'pack-growth', name: 'Growth', credits: 60, price: 24.99, badge: 'BEST VALUE' },
  { id: 'pack-pro', name: 'Pro', credits: 150, price: 49.99 }
];

export const mockSubscriptions = [
  {
    id: 'sub-1',
    companyId: 'comp-1',
    status: 'active',
    purchasedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 25).toISOString(),
    paymentMethod: 'credits',
    newMatchesCount: 2,
    lastScanAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'sub-2',
    companyId: 'comp-2',
    status: 'expiring',
    purchasedAt: new Date(Date.now() - 86400000 * 28).toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    paymentMethod: 'alacarte',
    newMatchesCount: 0,
    lastScanAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

export const mockJobs = [
  {
    id: 'job-1',
    subscriptionId: 'sub-1',
    title: 'Frontend Engineer, Dashboard',
    company: 'Stripe',
    location: 'Remote, US',
    employmentType: 'Full-time',
    experienceLevel: 'Mid-Senior',
    matchTier: MATCH_TIER.STRONG,
    matchScore: 92,
    isBookmarked: true,
    isNew: true,
    description: 'We are looking for a frontend engineer to help build the next generation of our dashboard.',
    url: 'https://stripe.com/jobs/123'
  },
  {
    id: 'job-2',
    subscriptionId: 'sub-1',
    title: 'Staff Software Engineer, Frontend',
    company: 'Stripe',
    location: 'Seattle, WA',
    employmentType: 'Full-time',
    experienceLevel: 'Staff',
    matchTier: MATCH_TIER.POSSIBLE,
    matchScore: 65,
    isBookmarked: false,
    isNew: false,
    description: 'Lead architecture for our merchant dashboard.',
    url: 'https://stripe.com/jobs/456'
  }
];

export const mockNotifications = [
  {
    id: 'notif-1',
    subscriptionId: 'sub-1',
    companyName: 'Stripe',
    jobTitle: 'Frontend Engineer, Dashboard',
    matchScore: 92,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false
  },
  {
    id: 'notif-2',
    subscriptionId: 'sub-1',
    companyName: 'Stripe',
    jobTitle: 'Staff Software Engineer, Frontend',
    matchScore: 65,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    read: true
  }
];

export const mockMatchProfile = {
  targetRoles: 'Frontend Engineer, React Developer',
  preferredLocation: 'Remote, US',
  experienceLevel: 'Mid-Level',
  additionalRequirements: 'Must use React. No management roles.'
};

export const mockSettings = {
  groqApiKey: 'gsk_mock_api_key_123',
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  smtpUser: 'user@example.com',
  defaultRecipient: 'me@example.com',
  digestFrequency: 'daily' // 'instant', 'daily', 'weekly'
};
