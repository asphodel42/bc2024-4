const http = require("http");
const fs = require("fs/promises");
const path = require("path");
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

// Function for GET requests
async function handleGetRequest(res, code) {
  try {
    const filePath = path.join(options.cache, `${code}.jpg`);
    const data = await fs.readFile(filePath);
    res.writeHead(200, { "Content-Type": "image/jpeg" });
    res.end(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Picture not found");
    } else {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Server error");
    }
  }
}

// Function for PUT requests
async function handlePutRequest(req, res, code) {
  try {
    const filePath = path.join(options.cache, `${code}.jpg`);
    const fileStream = fs.writeFile(filePath, Buffer.from([]));

    req.on("data", async (chunk) => {
      await fs.appendFile(filePath, chunk);
    });

    req.on("end", () => {
      res.writeHead(201, { "Content-Type": "text/plain" });
      res.end("Picture saved");
    });
  } catch (error) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Server error");
  }
}

// Function for DELETE requests
async function handleDeleteRequest(res, code) {
  try {
    const filePath = path.join(options.cache, `${code}.jpg`);
    await fs.unlink(filePath);
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Picture deleted");
  } catch (error) {
    if (error.code === "ENOENT") {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Picture not found");
    } else {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Server error");
    }
  }
}

// Creating web server
const server = http.createServer((req, res) => {
  const urlParts = req.url.split("/");
  const code = urlParts[1];

  if (!code || isNaN(code)) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Not correct request");
    return;
  }

  switch (req.method) {
    case "GET":
      handleGetRequest(res, code);
      break;
    case "PUT":
      handlePutRequest(req, res, code);
      break;
    case "DELETE":
      handleDeleteRequest(res, code);
      break;
    default:
      res.writeHead(405, { "Content-Type": "text/plain" });
      res.end("Method not allowed");
  }
});

// Start server with parametres
server.listen(options.port, options.host, () => {
  console.log(`Server started on http://${options.host}:${options.port}/`);
  console.log(`Cashing files in: ${options.cache}`);
});
