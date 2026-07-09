const { Cashfree } = require('cashfree-pg');
console.log("PRODUCTION:", Cashfree.PRODUCTION);
console.log("Environment.PRODUCTION:", Cashfree.Environment ? Cashfree.Environment.PRODUCTION : 'N/A');
