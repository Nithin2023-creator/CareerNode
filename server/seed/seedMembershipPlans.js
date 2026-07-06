require('dotenv').config();
const mongoose = require('mongoose');
const MembershipPlan = require('../models/MembershipPlan');

async function seedMembershipPlans() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/careernode';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding memberships');

    const plans = [
      {
        name: 'Free Plan',
        tier: 'free',
        monthlyPrice: 0,
        monthlyBonusCredits: 0,
        alaCarteDiscountPercent: 0,
        maxActiveSubscriptions: 1,
        perks: ['1 concurrent Job Finder company subscription', 'Standard a la carte pricing', 'No monthly bonus credits'],
        badge: 'FREE',
        isActive: true,
      },
      {
        name: 'Pro Membership',
        tier: 'pro',
        monthlyPrice: 29, // example price
        monthlyBonusCredits: 200,
        alaCarteDiscountPercent: 15,
        maxActiveSubscriptions: 5,
        perks: ['200 bonus credits monthly', '15% off all a la carte prices', 'Up to 5 concurrent subscriptions', '"PRO" badge in nav'],
        badge: 'PRO',
        isActive: true,
      },
      {
        name: 'Elite Membership',
        tier: 'elite',
        monthlyPrice: 99, // example price
        monthlyBonusCredits: 1000,
        alaCarteDiscountPercent: 30,
        maxActiveSubscriptions: null, // unlimited
        perks: ['1000 bonus credits monthly', '30% off all a la carte prices', 'Unlimited concurrent subscriptions', 'Early access to premium companies'],
        badge: 'ELITE',
        isActive: true,
      }
    ];

    for (const planData of plans) {
      await MembershipPlan.findOneAndUpdate(
        { tier: planData.tier },
        planData,
        { upsert: true, new: true }
      );
      console.log(`Seeded plan: ${planData.tier}`);
    }

    console.log('Membership plans seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding membership plans:', error);
    process.exit(1);
  }
}

seedMembershipPlans();
