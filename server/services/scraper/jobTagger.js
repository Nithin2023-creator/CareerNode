const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';
// Smaller chunk size than before since jobs may now carry a full page of scraped text.
const CHUNK_SIZE_WITH_TEXT = 5;
const CHUNK_SIZE_TITLE_ONLY = 10;

const EXPERIENCE_LEVELS = ['Entry-Level', 'Mid-Level', 'Senior', 'Staff/Principal', 'Manager/Director'];
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Not specified'];

class JobTagger {
  isApiKeyConfigured() {
    const key = process.env.GROQ_API_KEY;
    return key && key !== 'your_groq_api_key_here';
  }

  /**
   * Extracts strict, exact-match-able fields per job: experienceLevel and employmentType
   * from a fixed vocabulary, a normalized location string, and a cleaned plain-text
   * description - so downstream user filtering can do simple exact-match queries with no
   * AI involved at query time.
   */
  async tagJobs(jobs, { logger = console } = {}) {
    if (jobs.length === 0) {
      logger.log('[JobTagger] No jobs to tag (empty array). Skipping.');
      return [];
    }

    if (!this.isApiKeyConfigured()) {
      logger.warn('[JobTagger] GROQ_API_KEY is not set. Using mock heuristic tagging for ' + jobs.length + ' job(s).');
      return this._mockTagJobs(jobs);
    }

    const hasPageText = jobs.some((j) => j.pageText);
    const chunkSize = hasPageText ? CHUNK_SIZE_WITH_TEXT : CHUNK_SIZE_TITLE_ONLY;
    const taggedJobs = [];

    for (let i = 0; i < jobs.length; i += chunkSize) {
      const chunk = jobs.slice(i, i + chunkSize);
      const prompt = `
      You are an AI job data extractor. For each job below, extract STRICT structured fields:
      1. experienceLevel: exactly one of ${JSON.stringify(EXPERIENCE_LEVELS)}
      2. employmentType: exactly one of ${JSON.stringify(EMPLOYMENT_TYPES)}
      3. normalizedLocation: a clean, consistent location string (e.g. "Remote", "Bangalore, India", "San Francisco, CA"). If unclear, use "Not specified".
      4. description: a clean plain-text summary of the job posting (roughly 200-500 words), based on the pageText provided if present; otherwise infer briefly from the title only.
      5. tags: an array of strings representing role families/skills (e.g. ["Engineering", "Remote"]).

      Data to process (pageText, when present, was scraped from the job's own detail page or ATS API):
      ${JSON.stringify(chunk.map((j) => ({ url: j.url, title: j.title, location: j.location, pageText: (j.pageText || '').slice(0, 4000) })))}

      Return ONLY a valid JSON array of objects with keys: { "url", "experienceLevel", "employmentType", "normalizedLocation", "description", "tags" }.
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
        if (content) {
            const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (match && match[1]) content = match[1];
            
            const results = JSON.parse(content);
            
            for (const job of chunk) {
                const tagged = results.find(r => r.url === job.url);
                if (tagged) {
                    job.experienceLevel = EXPERIENCE_LEVELS.includes(tagged.experienceLevel) ? tagged.experienceLevel : 'Mid-Level';
                    job.employmentType = EMPLOYMENT_TYPES.includes(tagged.employmentType) ? tagged.employmentType : 'Not specified';
                    job.location = tagged.normalizedLocation || job.location;
                    job.description = tagged.description || job.description || '';
                    job.tags = tagged.tags || [];
                }
                taggedJobs.push(job);
            }
        } else {
            throw new Error('Invalid response');
        }
      } catch (err) {
        logger.error('[JobTagger] AI tagging failed for chunk:', err.message);
        taggedJobs.push(...this._mockTagJobs(chunk));
      }
    }

    return taggedJobs;
  }

  _mockTagJobs(jobs) {
    return jobs.map(job => {
      const title = (job.title || '').toLowerCase();
      let exp = 'Mid-Level';
      if (title.includes('senior') || title.includes('sr') || title.includes('lead')) exp = 'Senior';
      if (title.includes('staff') || title.includes('principal')) exp = 'Staff/Principal';
      if (title.includes('manager') || title.includes('director')) exp = 'Manager/Director';
      if (title.includes('junior') || title.includes('intern') || title.includes('entry')) exp = 'Entry-Level';

      let employmentType = 'Full-time';
      if (title.includes('intern')) employmentType = 'Internship';
      else if (title.includes('contract') || title.includes('contractor')) employmentType = 'Contract';
      else if (title.includes('part-time') || title.includes('part time')) employmentType = 'Part-time';

      return {
        ...job,
        experienceLevel: exp,
        employmentType,
        description: job.description || (job.pageText || '').slice(0, 500),
        tags: (job.location || '').toLowerCase().includes('remote') ? ['Remote'] : []
      };
    });
  }
}

module.exports = new JobTagger();
