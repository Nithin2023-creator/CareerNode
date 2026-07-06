const greenhouse = require('./greenhouse');
const lever = require('./lever');
const ashby = require('./ashby');
const smartrecruiters = require('./smartrecruiters');

const adapters = [greenhouse, lever, ashby, smartrecruiters];

module.exports = {
  detectAts: (url) => {
    return adapters.find(adapter => adapter.matches(url)) || null;
  }
};
