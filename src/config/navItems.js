import { features } from './features';

export const navItems = [
  { name: 'Dashboard', to: '/dashboard', tag: 'HUB' },
  { name: 'Job Finder', to: '/dashboard/job-finder', tag: 'JOBS' },
  { name: 'Cold Mailer', to: '/dashboard/emailer', tag: 'EMAIL' },
  { name: 'Resume Maker', to: '/dashboard/resume-maker', tag: 'RESUME' },
  { name: 'Automations', to: '/dashboard/automations', tag: features.automationsReleased ? 'FLOW' : 'SOON' },
];
