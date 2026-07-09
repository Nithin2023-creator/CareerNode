const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // Native EventSource (used for the scrape-logs SSE stream) can't set custom headers,
    // so fall back to a ?token= query param for that one use case.
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.query.token;
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_development';
    
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_development';
    
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (user) {
      req.user = user;
    }
    next();
  } catch (error) {
    // Ignore invalid tokens for optional auth
    next();
  }
};

const requireAdmin = async (req, res, next) => {
  // First ensure they are authenticated
  requireAuth(req, res, () => {
    // Then check if they are an admin
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
  });
};

module.exports = { requireAuth, requireAdmin, optionalAuth };
