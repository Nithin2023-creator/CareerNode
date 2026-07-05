const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Bundle = require('../models/Bundle');

const dummyBundle = {
  name: 'SaaS Recruiters - India',
  category: 'Tech Recruiters',
  region: 'India',
  description: 'A curated list of technical recruiters and HR managers at top B2B SaaS companies in India.',
  sampleTitles: ['VP of Talent', 'Senior Technical Recruiter', 'Head of HR'],
  contactCount: 5,
  creditCost: 100,
  alaCartePrice: 29,
  lastVerifiedAt: new Date(),
  recipients: [
    { companyName: 'Chargebee', hrName: 'Alice Smith', email: 'alice@example.com', role: 'Head of HR' },
    { companyName: 'Postman', hrName: 'Bob Jones', email: 'bob@example.com', role: 'Senior Technical Recruiter' },
    { companyName: 'Freshworks', hrName: 'Carol White', email: 'carol@example.com', role: 'VP of Talent' },
    { companyName: 'BrowserStack', hrName: 'Dave Brown', email: 'dave@example.com', role: 'Recruiter' },
    { companyName: 'Zoho', hrName: 'Eve Davis', email: 'eve@example.com', role: 'HR Manager' },
  ],
};

async function seed() {
  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/carrernode';
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB.');

    // Clear existing dummy bundle if any to avoid duplicates
    await Bundle.deleteMany({ name: dummyBundle.name });
    console.log('Cleared existing dummy bundles.');

    const newBundle = new Bundle(dummyBundle);
    await newBundle.save();
    console.log('Dummy bundle seeded successfully!');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
}

seed();
