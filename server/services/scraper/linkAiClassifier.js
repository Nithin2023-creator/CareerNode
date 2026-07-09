const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';
const CHUNK_SIZE = 10;

// Cheap heuristic fallback used only when GROQ_API_KEY isn't configured, or an AI
// call fails for a chunk - keeps the pipeline functional (just less precise) without AI.
const JOB_URL_PATTERNS = [
  /\/job\//i, /\/career\//i, /\/position\//i, /\/opening\//i, /\/req-?\d+/i, /\/role\//i, /\/posting\//i
];

class LinkAiClassifier {
  isApiKeyConfigured() {
    const key = process.env.GROQ_API_KEY;
    return key && key !== 'your_groq_api_key_here';
  }

  /**
   * Given candidate links surviving the cheap heuristic prefilter (junk domains/socials
   * already removed), ask AI to keep only links that are real, individual job postings -
   * dropping internal/nav pages, "About us", pagination, etc. that heuristics can't tell apart.
   */
  async classifyLinks(links, { logger = console } = {}) {
    if (links.length === 0) return { accepted: [], rejected: [] };

    if (!this.isApiKeyConfigured()) {
      logger.warn('[LinkAiClassifier] GROQ_API_KEY not set. Using heuristic fallback classification.');
      return this._heuristicClassify(links);
    }

    const accepted = [];
    const rejected = [];

    for (let i = 0; i < links.length; i += CHUNK_SIZE) {
      const chunk = links.slice(i, i + CHUNK_SIZE);
      const prompt = `
      You are an AI link classifier for a job-board scraper. Given links found on a company's careers page,
      determine which ones point to an actual individual job posting (a specific open role a candidate could apply to) -
      as opposed to navigation, social media, legal/privacy, marketing, "about us", or other internal site links.

      Links to classify:
      ${JSON.stringify(chunk.map(l => ({ href: l.href, linkText: l.linkText, surroundingText: l.surroundingText })))}

      Return ONLY a valid JSON array of objects with keys: { "href", "isJobPosting" } where isJobPosting is a boolean.
      `;

      try {
        const response = await axios.post(
          GROQ_API_URL,
          {
            model: MODEL,
            messages: [
              { role: 'system', content: 'You output strict JSON arrays only.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.1
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            }
          }
        );

        let content = response.data?.choices?.[0]?.message?.content;
        if (!content) throw new Error('Invalid response');

        const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match && match[1]) content = match[1];

        const results = JSON.parse(content);

        for (const link of chunk) {
          const classified = results.find(r => r.href === link.href);
          if (classified?.isJobPosting) {
            accepted.push(link);
          } else {
            rejected.push(link);
          }
        }
      } catch (err) {
        logger.error('[LinkAiClassifier] AI classification failed for chunk, falling back to heuristic:', err.message);
        const heuristicResult = this._heuristicClassify(chunk);
        accepted.push(...heuristicResult.accepted);
        rejected.push(...heuristicResult.rejected);
      }
    }

    return { accepted, rejected };
  }

  _heuristicClassify(links) {
    const accepted = [];
    const rejected = [];
    for (const link of links) {
      if (JOB_URL_PATTERNS.some(p => p.test(link.href))) {
        accepted.push(link);
      } else {
        rejected.push(link);
      }
    }
    return { accepted, rejected };
  }
}

module.exports = new LinkAiClassifier();
