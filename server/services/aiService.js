const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const isApiKeyConfigured = () => {
  const key = process.env.GROQ_API_KEY;
  return key && key !== 'your_groq_api_key_here' && key !== 'your_xai_api_key_here';
};

/**
 * Extract a JSON payload from a possibly markdown-wrapped LLM response.
 */
const extractJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch {
        throw new Error('Failed to parse JSON from markdown block.');
      }
    }
    throw new Error('Could not extract JSON from response.');
  }
};

/**
 * Heuristic column mapping used when no API key is configured.
 */
const getMockMapping = (headers) => {
  const mapped = {};
  headers.forEach((h) => {
    const lower = h.toLowerCase();
    if (lower.includes('comp') || lower.includes('org')) mapped[h] = 'companyName';
    else if (lower.includes('name') || lower.includes('hr') || lower.includes('contact')) mapped[h] = 'hrName';
    else if (lower.includes('mail')) mapped[h] = 'email';
    else if (lower.includes('role') || lower.includes('title') || lower.includes('position')) mapped[h] = 'role';
    else mapped[h] = 'dynamicData';
  });
  return mapped;
};

const callGroq = async (messages, temperature) => {
  const response = await axios.post(
    GROQ_API_URL,
    { model: MODEL, messages, temperature },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      maxBodyLength: Infinity,
    }
  );

  if (!response.data?.choices?.[0]?.message?.content) {
    throw new Error('Invalid response structure from Groq API');
  }
  return response.data.choices[0].message.content;
};

const aiService = {
  /**
   * Map CSV headers to standard recipient fields using the Groq LLM.
   */
  async mapColumns(headers, sampleRows) {
    if (!isApiKeyConfigured()) {
      console.warn('GROQ_API_KEY not set. Using mock column mapping.');
      return getMockMapping(headers);
    }

    const prompt = `
    You are an intelligent data mapping assistant.
    I will provide you with a list of CSV headers and a few sample rows of data.
    Map these headers to the following standard fields: "companyName", "hrName", "email", "role".
    If a header does not fit any of these, map it to "dynamicData".

    Headers: ${JSON.stringify(headers)}
    Sample Rows: ${JSON.stringify(sampleRows)}

    Return ONLY a valid JSON object where keys are the original headers and values are the mapped standard fields.
    Example: {"Company": "companyName", "Contact Person": "hrName", "Email Address": "email", "Job Title": "role", "Location": "dynamicData"}
    `;

    try {
      const content = await callGroq(
        [
          { role: 'system', content: 'You output strict JSON only.' },
          { role: 'user', content: prompt },
        ],
        0.1
      );
      return extractJSON(content);
    } catch (error) {
      const apiError = error.response?.data?.error || error.message;
      console.error('AI column mapping error:', apiError);
      throw new Error(`AI Mapping Error: ${apiError}`);
    }
  },

  /**
   * Clean and normalize recipient rows using the Groq LLM. Processed in
   * chunks to keep individual request payloads small.
   */
  async cleanData(rows) {
    if (!isApiKeyConfigured()) {
      console.warn('GROQ_API_KEY not set. Returning mock cleaned data.');
      return rows.map((r) => ({
        ...r,
        hrName: r.hrName
          ? r.hrName.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase())
          : r.hrName,
        companyName: r.companyName ? r.companyName.replace(/ INC| LLC/gi, '').trim() : r.companyName,
      }));
    }

    const CHUNK_SIZE = 20;
    const allCleanedRows = [];

    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);
      const prompt = `
      You are a data cleaning assistant for cold outreach.
      I will provide you an array of JSON objects representing CSV rows.
      Your task is to:
      1. Title case names (e.g., "john doe" -> "John Doe").
      2. Clean up company names (e.g., "GOOGLE INC" -> "Google", "Apple LLC" -> "Apple").
      3. Ensure emails are lowercase.

      Data to clean:
      ${JSON.stringify(chunk)}

      Return ONLY a valid JSON array of the cleaned objects. Maintain all original keys and structure.
      `;

      try {
        const content = await callGroq(
          [
            { role: 'system', content: 'You output strict JSON arrays only.' },
            { role: 'user', content: prompt },
          ],
          0.2
        );
        const cleanedChunk = extractJSON(content);
        allCleanedRows.push(...cleanedChunk);
      } catch (error) {
        const apiError = error.response?.data?.error || error.message;
        console.error('AI clean data chunk error:', apiError);
        throw new Error(`AI Cleaning Error: ${apiError}`);
      }
    }

    return allCleanedRows;
  },
};

module.exports = aiService;
