var fs = require("fs");
var name ='Arvind';
const fw = (name) => {
  fs.writeFile("greeting.txt", `hello, ${name}`, (err) => {
    if (err) console.log("error while writing into file");
  });
};
 fw(name);
