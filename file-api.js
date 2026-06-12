let fs = require('fs');
fs.writeFileSync('out.txt','this should be written in out file');
console.log('this should be print after previous line')