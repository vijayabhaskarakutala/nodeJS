let readline = require("readline");

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
let num1, num2;
rl.question("enter first number ", (ans1) => {
  num1 = parseFloat(ans1);
  rl.question("enter second number ", (ans2) => {
    num2 = parseFloat(ans2);
    if (isNaN(num1) || isNaN(num2)) console.log("invalid input");
    else {
      const sum = num1 + num2;
      console.log(`the sum of ${num1} and ${num2} is ${sum}`);
    }
    rl.close();
  });
});
