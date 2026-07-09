require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const Company = require('../models/Company');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careernode');
    console.log('MongoDB Connected.');

    const csvFilePath = path.join(__dirname, '../../companies.csv');
    const csvFile = fs.readFileSync(csvFilePath, 'utf8');

    const parsed = Papa.parse(csvFile, { header: true, skipEmptyLines: true });
    
    let processed = 0;
    
    for (const row of parsed.data) {
      if (!row.name || !row.careerUrl) {
          console.log(`Skipping invalid row (missing name or careerUrl): ${JSON.stringify(row)}`);
          continue;
      }
      
      const companyData = {
        name: row.name.trim(),
        careersPageUrl: row.careerUrl.trim(),
        logoUrl: row.logoUrl ? row.logoUrl.trim() : '',
        isActive: true, // Always active
        description: `${row.name.trim()} is a leading global company offering exciting career opportunities across engineering, technology, and business functions.`,
        category: 'Technology', // Provide a default category
        alaCartePrice: 9,
        creditCost: 10,
      };

      if (row.createdAt) companyData.createdAt = new Date(row.createdAt);
      if (row.updatedAt) companyData.updatedAt = new Date(row.updatedAt);

      let filter = { name: companyData.name };
      if (row._id && mongoose.Types.ObjectId.isValid(row._id)) {
        filter = { _id: row._id };
        companyData._id = row._id;
      }

      await Company.findOneAndUpdate(
        filter,
        companyData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      
      processed++;
    }

    console.log(`Successfully seeded ${processed} companies from CSV.`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding companies:', error);
    process.exit(1);
  }
}

seed();
