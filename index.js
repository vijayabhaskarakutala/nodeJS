const moment = require('moment-timezone');

moment.tz.setDefault('America/Los_Angeles');
let targetTimezone;
console.log(process.argv);
if(process.argv.length!=3){
    console.log('usage: node <script file> <timezone>')
}else targetTimezone = process.argv[2];

console.log(moment().tz(targetTimezone).format());