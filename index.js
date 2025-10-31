const { Command } = require('commander');
const http = require('http');
const fs = require('fs').promises;
const url = require('url');

const program = new Command();

// --- ЧАСТИНА 1: Commander ---
program
  .requiredOption('-i, --input <file>', 'path to input JSON file')
  .requiredOption('--host <host>', 'server host')
  .requiredOption('--port <port>', 'server port')
  .parse(process.argv);

const options = program.opts();

// Перевірка файлу
fs.access(options.input)
  .catch(() => {
    console.error(`Cannot find input file: ${options.input}`);
    process.exit(1);
  });

// --- ЧАСТИНА 2: Сервер ---
const server = http.createServer(async (req, res) => {
  try {
    // Ігноруємо іконку
    if (req.url === '/favicon.ico') {
      res.writeHead(204);
      res.end();
      return;
    }

    // 1. Парсимо URL та query-параметри
    const parsedUrl = url.parse(req.url, true);
    const query = parsedUrl.query;

    const minPetalLength = parseFloat(query.min_petal_length);
    const showVariety = query.variety === 'true';

    // 2. Читаємо JSON
    const data = await fs.readFile(options.input, 'utf8');
    const irisArray = JSON.parse(data);

    // 3. Фільтруємо дані
    let filteredIrises = irisArray;
    if (!isNaN(minPetalLength)) {
      filteredIrises = filteredIrises.filter(
        (flower) => flower['petal.length'] > minPetalLength
      );
    }

    //
    // --- Генеруємо XML вручну ---
    //
    const flowersXmlStrings = filteredIrises.map((flower) => {
      const petalLength = flower['petal.length'];
      const petalWidth = flower['petal.width'];
      
      const varietyTag = showVariety 
        ? `    <variety>${flower.variety}</variety>` 
        : '';

      return `
  <flower>
    <petal_length>${petalLength}</petal_length>
    <petal_width>${petalWidth}</petal_width>${varietyTag}
  </flower>`;
    });

    const finalXml = `<?xml version="1.0" encoding="UTF-8"?>
<irises>
${flowersXmlStrings.join('\n')}
</irises>`;
    //
    // --- Кінець ручної генерації ---
    //

    // 6. Надсилаємо XML у відповідь
    res.writeHead(200, { 'Content-Type': 'application/xml' });
    res.end(finalXml); 

  } catch (err) {
    console.error('Error handling request:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Error reading or processing file');
  }
});

// Запускаємо сервер
server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
});