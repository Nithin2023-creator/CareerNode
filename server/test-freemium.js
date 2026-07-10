const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
const userBootstrapService = require('./services/userBootstrapService');
const User = require('./models/User');
const Wallet = require('./models/Wallet');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const user = await User.create({
    name: 'Test Freemium',
    email: `test-${Date.now()}@example.com`,
    passwordHash: 'test'
  });

  console.log('Created user:', user._id);

  try {
    const result = await userBootstrapService.bootstrapNewUser(user._id);
    console.log('Bootstrap result:', result);

    const wallet = await Wallet.findOne({ userId: user._id });
    console.log('Wallet:', JSON.stringify(wallet, null, 2));
  } catch (err) {
    console.error('Error during bootstrap:', err);
  }

  await mongoose.disconnect();
}

run();
