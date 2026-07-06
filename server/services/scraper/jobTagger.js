const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

class JobTagger {
  isApiKeyConfigured() {
    const key = process.env.GROQ_API_KEY;
    return key && key !== 'your_groq_api_key_here';
  }

  async tagJobs(jobs) {
    if (!this.isApiKeyConfigured() || jobs.length === 0) {
      console.warn('[JobTagger] GROQ_API_KEY not set or empty jobs array. Using mock heuristic tagging.');
      return this._mockTagJobs(jobs);
    }

    const CHUNK_SIZE = 10;
    const taggedJobs = [];

    for (let i = 0; i < jobs.length; i += CHUNK_SIZE) {
      const chunk = jobs.slice(i, i + CHUNK_SIZE);
      const prompt = `
      You are an AI Job Tagger. Your task is to tag the given list of jobs.
      For each job, determine:
      1. experienceLevel: Must be one of: "Entry-Level", "Mid-Level", "Senior", "Staff/Principal", "Manager/Director".
      2. normalizedLocation: Clean up the location string (e.g., "Remote, US").
      3. tags: An array of strings representing role families or features (e.g., ["Engineering", "Remote"]).

      Data to tag:
      ${JSON.stringify(chunk)}

      Return ONLY a valid JSON array of objects with keys: { "url", "experienceLevel", "normalizedLocation", "tags" }.
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
                    job.experienceLevel = tagged.experienceLevel || 'Mid-Level';
                    job.location = tagged.normalizedLocation || job.location;
                    job.tags = tagged.tags || [];
                }
                taggedJobs.push(job);
            }
        } else {
            throw new Error('Invalid response');
        }
      } catch (err) {
        console.error('[JobTagger] AI tagging failed for chunk:', err.message);
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

      return {
        ...job,
        experienceLevel: exp,
        tags: (job.location || '').toLowerCase().includes('remote') ? ['Remote'] : []
      };
    });
  }
}

module.exports = new JobTagger();
