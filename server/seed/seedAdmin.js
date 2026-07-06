require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await connectDB();
    
    // Change this to the email you want to promote to admin
    const adminEmail = process.argv[2] || 'test@example.com'; 
    
    let user = await User.findOne({ email: adminEmail.toLowerCase() });
    
    if (!user) {
      console.log(`User ${adminEmail} not found. Please sign up or login with Google first before promoting to admin.`);
      process.exit(1);
    }
    
    user.isAdmin = true;
    await user.save();
    
    console.log(`Successfully promoted ${adminEmail} to admin status.`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed admin:', error);
    process.exit(1);
  }
};

seedAdmin();
