const { Command } = require('commander');
const http = require('http');
const fs = require('fs');

const program = new Command();

program
  .requiredOption('-i, --input <path>', 'path to input file')
  .requiredOption('-h, --host <host>', 'server host')
  .requiredOption('-p, --port <port>', 'server port')
  .parse(process.argv);

const options = program.opts();

// Перевірка на те, чи існує файл
if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file');
  process.exit(1);
}

// Створення HTTP сервера
const server = http.createServer((req, res) => {
  fs.readFile(options.input, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Error reading file');
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    }
  });
});

// Слухаємо вказаний хост і порт
server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
});
