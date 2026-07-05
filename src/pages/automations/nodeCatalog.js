export const nodeCatalog = [
  // Job Finder
  {
    id: 'jf_trigger_match',
    category: 'Job Finder',
    kind: 'trigger',
    label: 'New Job Match Found',
    description: 'Triggers when a new job matches your profile.',
    icon: 'Search',
    accent: 'var(--color-accent-blue)',
    fields: [
      { name: 'matchTier', type: 'select', label: 'Minimum Match Tier', options: ['Strong', 'Possible', 'Any'] }
    ]
  },
  {
    id: 'jf_trigger_expiring',
    category: 'Job Finder',
    kind: 'trigger',
    label: 'Subscription Expiring Soon',
    description: 'Triggers 3 days before a subscription expires.',
    icon: 'Clock',
    accent: 'var(--color-accent-blue)',
    fields: [
      { name: 'daysBefore', type: 'number', label: 'Days Before Expiry', defaultValue: 3 }
    ]
  },
  {
    id: 'jf_action_subscribe',
    category: 'Job Finder',
    kind: 'action',
    label: 'Subscribe to Company',
    description: 'Starts a 30-day job monitor for a specific company.',
    icon: 'Store',
    accent: 'var(--color-accent-blue)',
    fields: [
      { name: 'company', type: 'text', label: 'Company Name' }
    ]
  },
  {
    id: 'jf_action_bookmark',
    category: 'Job Finder',
    kind: 'action',
    label: 'Bookmark Job',
    description: 'Saves a job to your bookmarked list.',
    icon: 'Bookmark',
    accent: 'var(--color-accent-blue)',
    fields: [
      { name: 'listName', type: 'text', label: 'List Name', defaultValue: 'Default' }
    ]
  },

  // Cold Mailer
  {
    id: 'cm_trigger_completed',
    category: 'Cold Mailer',
    kind: 'trigger',
    label: 'Campaign Completed',
    description: 'Triggers when all emails in a campaign are sent.',
    icon: 'CheckCircle',
    accent: 'var(--color-accent-yellow)',
    fields: []
  },
  {
    id: 'cm_action_create',
    category: 'Cold Mailer',
    kind: 'action',
    label: 'Create Campaign',
    description: 'Drafts a new cold outreach campaign.',
    icon: 'MailPlus',
    accent: 'var(--color-accent-yellow)',
    fields: [
      { name: 'campaignName', type: 'text', label: 'Campaign Name' }
    ]
  },
  {
    id: 'cm_action_send',
    category: 'Cold Mailer',
    kind: 'action',
    label: 'Send Email',
    description: 'Sends an email to a specific contact.',
    icon: 'Send',
    accent: 'var(--color-accent-yellow)',
    fields: [
      { name: 'template', type: 'select', label: 'Template', options: ['Intro', 'Follow-up', 'Custom'] }
    ]
  },
  {
    id: 'cm_action_attach',
    category: 'Cold Mailer',
    kind: 'action',
    label: 'Attach HR Bundle',
    description: 'Attaches a purchased HR contact bundle to a campaign.',
    icon: 'Paperclip',
    accent: 'var(--color-accent-yellow)',
    fields: [
      { name: 'bundleId', type: 'text', label: 'Bundle ID' }
    ]
  },

  // Resume Maker
  {
    id: 'rm_action_generate',
    category: 'Resume Maker',
    kind: 'action',
    label: 'Generate Tailored Resume',
    description: 'Creates a new resume tailored to a specific job description.',
    icon: 'FileText',
    accent: 'black',
    fields: [
      { name: 'baseResume', type: 'select', label: 'Base Resume', options: ['Main', 'Alternative'] }
    ]
  },

  // Wallet
  {
    id: 'wallet_action_credits',
    category: 'Wallet',
    kind: 'action',
    label: 'Purchase Credits',
    description: 'Adds credits to your wallet automatically.',
    icon: 'CreditCard',
    accent: '#fde047', // Muted yellow
    fields: [
      { name: 'amount', type: 'number', label: 'Amount', defaultValue: 100 }
    ]
  },
  {
    id: 'wallet_action_bundle',
    category: 'Wallet',
    kind: 'action',
    label: 'Purchase Bundle',
    description: 'Purchases a specific HR contact bundle.',
    icon: 'Package',
    accent: '#fde047',
    fields: [
      { name: 'bundleId', type: 'text', label: 'Bundle ID' }
    ]
  },

  // Logic
  {
    id: 'logic_if',
    category: 'Logic',
    kind: 'logic',
    label: 'Condition (If)',
    description: 'Branches workflow based on a condition.',
    icon: 'GitBranch',
    accent: 'rgba(0,0,0,0.4)',
    fields: [
      { name: 'condition', type: 'text', label: 'Expression' }
    ]
  },
  {
    id: 'logic_delay',
    category: 'Logic',
    kind: 'logic',
    label: 'Delay',
    description: 'Pauses workflow execution for a set time.',
    icon: 'Hourglass',
    accent: 'rgba(0,0,0,0.4)',
    fields: [
      { name: 'duration', type: 'number', label: 'Duration (hours)', defaultValue: 24 }
    ]
  }
];
