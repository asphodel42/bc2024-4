const http = require("http");
const { Command } = require("commander");
const program = new Command();

// Setting CLI parametres
program
  .requiredOption("-h, --host <host>", "server host")
  .requiredOption("-p, --port <port>", "server port")
  .requiredOption("-c, --cache <path>", "path to cache dir")
  .parse(process.argv);

const options = program.opts();

// Checking required options
if (!options.host || !options.port || !options.cache) {
  console.error("Error: All required options must be passed.");
  process.exit(1);
}

// Creating web server
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Server works!\n");
});

// Start server with parametres
server.listen(options.port, options.host, () => {
  console.log(`Server started on http://${options.host}:${options.port}/`);
  console.log(`Cashing files in: ${options.cache}`);
});
