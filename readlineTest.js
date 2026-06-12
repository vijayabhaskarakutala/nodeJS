let rl = require("readline");
const read = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
});
read.question("what is ur name", (name) => {
  console.log(`entered input is : ${name}`);
  read.close();
});
