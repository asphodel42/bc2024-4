const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const { Command } = require("commander");

const program = new Command();

// Setting CLI parametres
program
  .option("-h, --host <host>", "server host")
  .option("-p, --port <port>", "server port")
  .option("-c, --cache <path>", "path to cache dir")
  .parse(process.argv);

const { host, port, cache } = program.opts();

// Checking required options
if (!host || !port || !cache) {
  console.error("Error: All required options must be specified.");
  program.help();
  process.exit(1);
}

// Creating web-server
const server = http.createServer(async (req, res) => {
  const httpCode = path.basename(req.url);
  const imagePath = path.join(cache, `${httpCode}.jpg`);

  if (req.method === "GET") {
    try {
      const image = await fs.readFile(imagePath);
      res.writeHead(200, { "Content-Type": "image/jpeg" });
      res.end(image);
    } catch (error) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Image not found\n");
    }

  } else if (req.method === "PUT") {
    let body = [];

    req.on("data", chunk => {
      body.push(chunk);
    });

    req.on("end", async () => {
      try {
        await fs.writeFile(imagePath, Buffer.concat(body));
        res.writeHead(201, { "Content-Type": "text/plain" });
        res.end("Image saved\n");
      } catch (error) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error\n");
      }
    });

  } else if (req.method === "DELETE") {
    try {
      await fs.unlink(imagePath);
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Image deleted\n");
    } catch (error) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Image not found\n");
    }

  } else {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method not allowed\n");
  }
});

server.listen(port, host, () => {
  console.log(`Server started at http://${host}:${port}`);
});
