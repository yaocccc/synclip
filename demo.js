const clipboardy = require('clipboardy');
clipboardy.writeSync('🦄');
const aaa = clipboardy.readSync();
console.log(aaa);
