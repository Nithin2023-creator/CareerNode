class LinkClassifier {
  constructor() {
    this.junkPatterns = [
      /facebook\.com/i, /twitter\.com/i, /x\.com/i, /linkedin\.com\/share/i,
      /instagram\.com/i, /privacy/i, /terms/i, /about-us/i, /contact/i,
      /^mailto:/i, /^tel:/i, /^javascript:/i, /^#/
    ];
    
    this.jobPatterns = [
      /\/job\//i, /\/career\//i, /\/position\//i, /\/opening\//i, /\/req-?\d+/i
    ];
  }

  filterLinks(rawLinks, baseDomain) {
    const accepted = [];
    const ambiguous = [];
    
    const seen = new Set();

    for (const link of rawLinks) {
      if (seen.has(link.href)) continue;
      seen.add(link.href);

      let isJunk = false;
      for (const pattern of this.junkPatterns) {
        if (pattern.test(link.href)) {
          isJunk = true;
          break;
        }
      }
      
      try {
        const u = new URL(link.href);
        if (u.hostname !== baseDomain && 
            !u.hostname.includes('greenhouse') && 
            !u.hostname.includes('lever') && 
            !u.hostname.includes('ashby') && 
            !u.hostname.includes('smartrecruiters')) {
            isJunk = true;
        }
      } catch (e) {
        isJunk = true;
      }

      if (isJunk) continue;

      let isJob = false;
      for (const pattern of this.jobPatterns) {
        if (pattern.test(link.href)) {
          isJob = true;
          break;
        }
      }

      if (isJob) {
        accepted.push(link);
      } else {
        ambiguous.push(link);
      }
    }

    return { accepted, ambiguous };
  }
}

module.exports = new LinkClassifier();
