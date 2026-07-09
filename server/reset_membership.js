require('dotenv').config({ path: __dirname + '/.env.local' });
require('dotenv').config({ path: __dirname + '/.env' }); // fallback
const mongoose = require('mongoose');
const UserMembership = require(__dirname + '/models/UserMembership');
const MembershipPlan = require(__dirname + '/models/MembershipPlan');

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGODB_URI found in env');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('Connected to DB');
  
  const freePlan = await MembershipPlan.findOne({ tier: 'free' });
  if (!freePlan) {
    console.log('Free plan not found. Please run seeder first.');
    process.exit(1);
  }
  
  const result = await UserMembership.updateMany(
    { status: 'pending_authorization' },
    { $set: { status: 'active', planId: freePlan._id, pendingPlanId: null, cfSubscriptionId: null, cancelAtPeriodEnd: false } }
  );
  
  console.log(`Updated ${result.modifiedCount} stuck memberships back to free plan`);
  process.exit(0);
}
run();
