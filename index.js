/* DEPENDENCIES */
const express = require("express");
const { spawn, exec } = require("child_process");
var cors = require("cors");

/* SERVER */

// configuration
const app = express();
const port = process.env.PORT || 8888;
const corsOptions = { origin: "*" };
if (process.env.HEROKU === "production") {
  corsOptions.origin = "https://searchthesourcecode.com";
}

// start server
app.listen(port);
console.log("Server started! At http://localhost:" + port);

// listen for input
app.get("/", cors(corsOptions), async (req, res) => {
  const { domain, search } = req.query;

  if (!domain || !search) {
    return res.send("Missing params.");
  }

  // set filename to hostname + timestamp
  const protocol = domain.indexOf("http") > -1 ? "" : "http://";
  const url = new URL(protocol + domain);
  const filename = url.hostname + "_" + Date.now() + ".json";

  // create directories
  prep();

  // run scrapy
  const response = await scrape(filename, search, url.href);

  // response
  if (response == 0) {
    const results = require(`${__dirname}/stsc/feed/${filename}`);

    res.header("Content-Type", "application/json");
    res.json(results);
  } else {
    res.send("error");
  }
});

/* FUNCTIONS */
const prep = () => {
  exec(`mkdir -p ${__dirname}/stsc/feed`);
  exec(`mkdir -p ${__dirname}/stsc/logs`);
};

// run scrapy via child_process
const scrape = (filename, string, url) => {
  const path = `${__dirname}/stsc`; // working directory to run scrapy
  const file = `${path}/feed/${filename}`; // path and filename for results
  const query = `query=${string}`; // search query provided by searchthesourcecode.com
  const start = `start=${url}`; // start url provided by searchthesourcecode.com
  const command = "scrapy"; // scrapy command
  const args = ["crawl", "searchthesourcecode", "--output", file, "-a", query, "-a", start];
  const shell = spawn(command, args, { cwd: path });

  return new Promise((resolve) => {
    // stdout, see what's happening
    shell.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    // errors
    shell.stderr.on("data", (data) => {
      error(data); // log error
      resolve(1); // resolve with error
    });

    // success
    shell.on("close", (code) => {
      resolve(code);
    });
  });
};

// error reporting
const error = (message) => {
  console.error(message);
};
