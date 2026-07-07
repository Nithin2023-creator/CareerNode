// Single source of truth for flat-priced "credit actions" that are not backed
// by a DB catalog model (unlike Company / Bundle, which carry their own
// creditCost / alaCartePrice). Prices here can be tuned without code changes
// elsewhere since both the API and the frontend read from this catalog.
const pricingCatalog = {
  'resume-tailor': {
    label: 'AI Resume Tailoring',
    creditCost: 4,
    cashPriceUsd: 5,
  },
  'resume-export': {
    label: 'Resume PDF Export',
    creditCost: 2,
    cashPriceUsd: 3,
  },
};

const getPricingEntry = (actionId) => pricingCatalog[actionId] || null;

module.exports = { pricingCatalog, getPricingEntry };
