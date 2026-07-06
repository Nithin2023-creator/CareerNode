require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('../models/Company');

const seedCompanies = [
  {
    name: 'Stripe',
    logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100&h=100&fit=crop',
    category: 'Fintech',
    tier: 'premium',
    description: 'Financial infrastructure platform for the internet.',
    careersPageUrl: 'https://stripe.com/jobs',
    creditCost: 15,
    alaCartePrice: 19.99,
    isActive: true
  },
  {
    name: 'Vercel',
    logoUrl: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=100&h=100&fit=crop',
    category: 'Developer Tools',
    tier: 'standard',
    description: 'Frontend cloud platform for developing faster.',
    careersPageUrl: 'https://vercel.com/careers',
    creditCost: 10,
    alaCartePrice: 14.99,
    isActive: true
  },
  {
    name: 'OpenAI',
    logoUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=100&h=100&fit=crop',
    category: 'AI / ML',
    tier: 'premium',
    description: 'Creating safe artificial general intelligence that benefits all of humanity.',
    careersPageUrl: 'https://openai.com/careers',
    creditCost: 20,
    alaCartePrice: 24.99,
    isActive: true
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careernode');
    console.log('MongoDB Connected.');

    let inserted = 0;
    for (const company of seedCompanies) {
      const exists = await Company.findOne({ name: company.name });
      if (exists) {
        console.log(`Skipping "${company.name}" — already exists.`);
        continue;
      }
      await Company.create(company);
      inserted++;
    }

    console.log(`Seeded ${inserted} new companies (${seedCompanies.length - inserted} skipped).`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding companies:', error);
    process.exit(1);
  }
}

seed();
