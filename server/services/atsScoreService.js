// A deterministic, non-AI service for scoring resumes

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with',
  'i', 'you', 'we', 'they', 'our', 'my', 'your', 'this', 'but', 'or', 'if', 'not', 'can', 'all', 'any', 'about', 'more', 'have', 'which', 'who', 'how', 'what', 'when', 'where', 'why'
]);

const ACTION_VERBS = new Set([
  'achieved', 'improved', 'trained', 'mentored', 'managed', 'created', 'resolved', 'volunteered', 'influenced', 'increased', 'decreased', 'launched', 'negotiated', 'developed', 'coordinated', 'designed', 'built', 'spearheaded', 'implemented', 'optimized', 'reduced', 'led', 'delivered'
]);

function extractKeywords(text) {
  if (!text) return [];
  
  // Basic tokenization: lowercase, remove punctuation, split by whitespace
  const words = text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/);
  
  const frequency = {};
  for (const word of words) {
    if (word.length > 2 && !STOP_WORDS.has(word)) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  }

  // Also try to find some basic 2-word phrases (bigrams) that might be skills
  const bigrams = [];
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i];
    const w2 = words[i+1];
    if (w1.length > 2 && w2.length > 2 && !STOP_WORDS.has(w1) && !STOP_WORDS.has(w2)) {
      bigrams.push(`${w1} ${w2}`);
    }
  }
  
  for (const phrase of bigrams) {
    frequency[phrase] = (frequency[phrase] || 0) + 1.5; // Slight boost for phrases
  }

  // Sort by frequency and take top ~25
  const sorted = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(entry => entry[0]);
    
  return sorted;
}

function flattenResumeText(resumeData) {
  let text = '';
  
  if (resumeData.personalInfo) {
    text += Object.values(resumeData.personalInfo).join(' ') + ' ';
  }
  
  if (resumeData.education) {
    resumeData.education.forEach(edu => {
      text += Object.values(edu).join(' ') + ' ';
    });
  }
  
  if (resumeData.skills) {
    resumeData.skills.forEach(skillGroup => {
      text += `${skillGroup.category} ${skillGroup.items} `;
    });
  }
  
  if (resumeData.experience) {
    resumeData.experience.forEach(exp => {
      text += `${exp.company || ''} ${exp.role || ''} ${exp.location || ''} `;
      if (exp.bullets) text += exp.bullets.join(' ') + ' ';
    });
  }
  
  if (resumeData.projects) {
    resumeData.projects.forEach(proj => {
      text += `${proj.name || ''} ${proj.techStack || ''} `;
      if (proj.bullets) text += proj.bullets.join(' ') + ' ';
    });
  }
  
  if (resumeData.publications) {
    resumeData.publications.forEach(pub => {
      text += Object.values(pub).join(' ') + ' ';
    });
  }
  
  if (resumeData.achievements) {
    text += resumeData.achievements.join(' ') + ' ';
  }
  
  return text.toLowerCase();
}

function scoreResume(resumeData, jobDescription = '') {
  const suggestions = [];
  let score = 0;
  const breakdown = {
    keywords: 0,
    completeness: 0,
    actionVerbs: 0,
    formatting: 0
  };
  
  const resumeText = flattenResumeText(resumeData);
  
  // 1. Keyword Match (40 points if JD provided, else skipped)
  const matchedKeywords = [];
  const missingKeywords = [];
  
  if (jobDescription && jobDescription.trim().length > 0) {
    const jdKeywords = extractKeywords(jobDescription);
    
    if (jdKeywords.length > 0) {
      for (const kw of jdKeywords) {
        // Simple substring search; a real app might use stemming or whole-word match
        if (resumeText.includes(kw)) {
          matchedKeywords.push(kw);
        } else {
          missingKeywords.push(kw);
        }
      }
      
      const matchRatio = matchedKeywords.length / jdKeywords.length;
      breakdown.keywords = Math.round(matchRatio * 40);
      
      if (matchRatio < 0.5) {
        suggestions.push(`Add more keywords from the job description (e.g. ${missingKeywords.slice(0,3).join(', ')}).`);
      }
    } else {
      breakdown.keywords = 40; // Free points if we couldn't extract anything
    }
  } else {
    // If no JD, redistribute points
    breakdown.keywords = 40; 
  }
  
  // 2. Completeness (30 points)
  let completePoints = 0;
  
  if (resumeData.personalInfo?.email && resumeData.personalInfo?.phone) completePoints += 5;
  else suggestions.push("Ensure contact info (email and phone) is filled out.");
  
  if (resumeData.personalInfo?.linkedin) completePoints += 5;
  else suggestions.push("Adding a LinkedIn profile can boost your credibility.");
  
  if (resumeData.education && resumeData.education.length > 0) completePoints += 5;
  else suggestions.push("Add at least one education entry.");
  
  if (resumeData.skills && resumeData.skills.length > 0) completePoints += 5;
  else suggestions.push("Add a skills section to help ATS parse your abilities.");
  
  if (resumeData.experience && resumeData.experience.length > 0) completePoints += 10;
  else if (resumeData.projects && resumeData.projects.length > 0) {
    completePoints += 10; // Projects count if no experience
    suggestions.push("Consider adding professional experience if you have any.");
  } else {
    suggestions.push("Add experience or projects to showcase your work.");
  }
  
  breakdown.completeness = completePoints;

  // 3. Action Verbs (20 points)
  let actionVerbPoints = 0;
  let bulletCount = 0;
  let verbCount = 0;
  
  const checkBullets = (bullets) => {
    if (!bullets) return;
    bullets.forEach(b => {
      if (!b.trim()) return;
      bulletCount++;
      const firstWord = b.trim().split(/\s+/)[0].toLowerCase();
      // Check if it starts with a common verb suffix or is in our list
      if (ACTION_VERBS.has(firstWord) || firstWord.endsWith('ed') || firstWord.endsWith('ing') || firstWord.endsWith('s')) {
        verbCount++;
      }
    });
  };
  
  if (resumeData.experience) resumeData.experience.forEach(exp => checkBullets(exp.bullets));
  if (resumeData.projects) resumeData.projects.forEach(proj => checkBullets(proj.bullets));
  
  if (bulletCount > 0) {
    const verbRatio = verbCount / bulletCount;
    actionVerbPoints = Math.round(verbRatio * 20);
    if (verbRatio < 0.7) {
      suggestions.push("Start more bullet points with strong action verbs (e.g. Developed, Led, Optimized).");
    }
  } else {
    suggestions.push("Use bullet points in your experience/projects to describe achievements.");
  }
  breakdown.actionVerbs = actionVerbPoints;
  
  // 4. Formatting / Structure (10 points)
  let formatPoints = 10;
  
  // Check for overly long bullets
  let hasLongBullets = false;
  const checkLongBullets = (bullets) => {
    if (!bullets) return;
    bullets.forEach(b => {
      if (b.length > 200) hasLongBullets = true;
    });
  };
  if (resumeData.experience) resumeData.experience.forEach(exp => checkLongBullets(exp.bullets));
  
  if (hasLongBullets) {
    formatPoints -= 5;
    suggestions.push("Keep bullet points concise (under ~200 characters) for better readability.");
  }
  
  // Check if summary/objective is too long (if we had one, but we don't in this format)
  // We'll just give them the points if they didn't lose them
  breakdown.formatting = formatPoints;
  
  // Sum it up
  score = breakdown.keywords + breakdown.completeness + breakdown.actionVerbs + breakdown.formatting;
  
  if (suggestions.length === 0) {
    suggestions.push("Your resume looks great! Make sure it accurately reflects your experience.");
  }
  
  return {
    overall: score,
    breakdown,
    matchedKeywords,
    missingKeywords,
    suggestions,
    updatedAt: new Date().toISOString()
  };
}

module.exports = {
  extractKeywords,
  scoreResume
};
