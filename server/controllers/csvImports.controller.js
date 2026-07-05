const fs = require('fs');
const Papa = require('papaparse');
const aiService = require('../services/aiService');

// POST /api/csv-imports  (multipart: csvFile)
// Parses the uploaded CSV and returns AI-suggested column mappings.
const importCsv = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf8');

    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const { data, meta } = results;

        if (!data || data.length === 0) {
          return res.status(400).json({ error: 'CSV is empty' });
        }

        const headers = meta.fields;
        const sampleRows = data.slice(0, 3);

        try {
          const mappedFields = await aiService.mapColumns(headers, sampleRows);
          res.json({
            data: {
              headers,
              mappedFields,
              rows: data,
              filename: req.file.filename,
            },
          });
        } catch (error) {
          console.error('AI mapping error:', error);
          res.status(500).json({ error: 'Failed to map columns using AI.' });
        }
      },
      error: (error) => {
        res.status(400).json({ error: `Failed to parse CSV: ${error.message}` });
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/csv-imports/clean-rows  (body: { rows: [...] })
// Runs AI cleanup over standardized recipient rows.
const cleanRows = async (req, res, next) => {
  try {
    const { rows } = req.body;
    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({ error: 'Invalid payload: rows array is required' });
    }

    const cleanedRows = await aiService.cleanData(rows);
    res.json({ data: { cleanedRows } });
  } catch (error) {
    next(error);
  }
};

module.exports = { importCsv, cleanRows };
