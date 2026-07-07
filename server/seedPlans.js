const mongoose = require('mongoose');
require('dotenv').config();
const MembershipPlan = require('./models/MembershipPlan');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carrernode');
  
  const freePlan = await MembershipPlan.findOne({ tier: 'free' });
  if (!freePlan) {
    await MembershipPlan.create({
      name: 'Free',
      tier: 'free',
      monthlyPrice: 0,
      monthlyBonusCredits: 0,
      alaCarteDiscountPercent: 0,
      perks: ['Basic access', 'Standard support'],
      badge: 'Free',
      isActive: true
    });
    console.log('Free plan created');
  }

  const proPlan = await MembershipPlan.findOne({ tier: 'pro' });
  if (!proPlan) {
    await MembershipPlan.create({
      name: 'Pro',
      tier: 'pro',
      monthlyPrice: 999,
      monthlyBonusCredits: 50,
      alaCarteDiscountPercent: 15,
      perks: ['50 monthly credits', '15% discount', 'Priority support'],
      badge: 'Pro',
      isActive: true
    });
    console.log('Pro plan created');
  }
  
  console.log('Seeding done');
  process.exit(0);
}

seed();
