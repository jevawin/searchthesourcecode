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
  const { domain, search, ua } = req.query;

  if (!domain || !search) {
    return res.send("Missing params.");
  }

  // set filename to hostname + timestamp
  const protocol = domain.indexOf("http") > -1 ? "" : "http://";
  const url = new URL(protocol + domain);
  const filename = url.hostname + "_" + Date.now() + ".json";
  // const agent = ua === "true";
  const agent = true;

  // create directories
  prep();

  // run scrapy
  const response = await scrape(filename, search, url.href);

  // set response type to json
  res.header("Content-Type", "application/json");

  // response
  if (response == 0) {
    const results = require(`${__dirname}/stsc/feed/${filename}`);
    res.json(results);
  } else {
    res.json(response);
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
  //const ua = `USER_AGENT="Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/603.1.23 (KHTML, like Gecko) Version/10.0 Mobile/14E5239e Safari/602.1"`; // iPhone-like user agent to access sites that reject bots
  const args = ["crawl", "searchthesourcecode", "--output", file, "-a", query, "-a", start/*, "-s", ua*/];
  const shell = spawn(command, args, { cwd: path });
  // console.log(`${command} ${args.join(' ')}`)

  return new Promise((resolve) => {
    // errors
    shell.stderr.on("data", (data) => {
      resolve(JSON.parse(data)); // resolve with error code
    });

    // success
    shell.on("close", (code) => {
      resolve(code);
    });
  });
};