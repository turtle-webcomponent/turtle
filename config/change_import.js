import fs from 'fs';

const file = './src/turtle_component.js';
const linesToChange = [
  ["import moveTurtle from '../assets/turtle.png';", 'const moveTurtle = '],
  ["import idleTurtle from '../assets/idle_turtle.png';", 'const idleTurtle = '],
]
const files = fs.readdirSync('./public/');

for (let i = 0; i < linesToChange.length; i++) {
  linesToChange[i][1] += `'./public/${files[i]}';`;
}

let formatted = undefined;

fs.readFile(file, 'utf8', function (_, data) {
  linesToChange.forEach((line) => {
    let re = new RegExp(line[0]);
    if (!formatted) formatted = data.replace(re, line[1]);
    else formatted = formatted.replace(re, line[1]);
  });

  fs.writeFile(file, formatted, 'utf8', function (err) {
    if (err) return console.log(err);
  });
});

