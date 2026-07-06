const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const MembershipPlan = require('../models/MembershipPlan');
const UserMembership = require('../models/UserMembership');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (user) => {
  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_development';
  return jwt.sign(
    { userId: user._id, email: user.email },
    jwtSecret,
    { expiresIn: '7d' }
  );
};

exports.googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }

    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    const payload = await response.json();
    const { sub: googleId, email, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ googleId });
    if (!user) {
      // Check if user exists by email but without googleId
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        user.name = name;
        user.picture = picture;
        await user.save();
      } else {
        user = await User.create({ googleId, email, name, picture });
        // Initialize wallet for new user (100 credits for free)
        await Wallet.create({
          userId: user._id,
          balance: 100,
        });
        
        // Grant free membership
        const freePlan = await MembershipPlan.findOne({ tier: 'free' });
        if (freePlan) {
          const nextYear = new Date();
          nextYear.setFullYear(nextYear.getFullYear() + 10);
          await UserMembership.create({
            userId: user._id,
            planId: freePlan._id,
            status: 'active',
            renewsAt: nextYear,
          });
        }
      }
    }

    const authToken = signToken(user);

    res.status(200).json({
      token: authToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    next(error);
  }
};

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash
    });

    // Initialize wallet
    await Wallet.create({
      userId: user._id,
      balance: 100,
    });
    
    // Grant free membership
    const freePlan = await MembershipPlan.findOne({ tier: 'free' });
    if (freePlan) {
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 10);
      await UserMembership.create({
        userId: user._id,
        planId: freePlan._id,
        status: 'active',
        renewsAt: nextYear,
      });
    }

    const authToken = signToken(user);

    res.status(201).json({
      token: authToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    next(error);
  }
};

exports.getMe = async (req, res) => {
  const user = req.user;
  res.status(200).json({
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      isAdmin: user.isAdmin,
    },
  });
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ message: 'Please login with Google' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const authToken = signToken(user);

    res.status(200).json({
      token: authToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};
