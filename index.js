const { Command } = require('commander');
const fs = require('fs').promises;

const program = new Command();

program
  .option('-f, --file <path>', 'path to json file', 'iris.json')
  .option('-p, --print', 'print dataset to console')
  .parse(process.argv);

const options = program.opts();

if (options.print) {
  fs.readFile(options.file, 'utf8')
    .then(data => console.log(data))
    .catch(err => console.error('Error reading file:', err));
}
