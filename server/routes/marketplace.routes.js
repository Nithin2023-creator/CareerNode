const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

// Public route to list active companies for the Job Finder marketplace
router.get('/companies', async (req, res, next) => {
  try {
    const companies = await Company.find({ isActive: true }).sort({ name: 1 });
    
    // Map _id to id so frontend CompanyProductCard works seamlessly
    const mapped = companies.map((c) => {
      const { _id, ...rest } = c.toObject();
      return { id: _id.toString(), ...rest };
    });

    res.json({ data: mapped });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
