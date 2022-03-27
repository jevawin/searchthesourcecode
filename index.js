/* DEPENDENCIES */
const express = require("express");
const { spawn } = require("child_process");
var cors = require("cors");

/* SERVER */

// configuration
const app = express();
const port = process.env.PORT || 8888;
const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

// start server
app.listen(port);
console.log("Server started! At http://localhost:" + port);

// listen for input
app.get("/", cors(corsOptions), async (req, res) => {
  const { domain, search } = req.query;
  // search parameters
  const START_URL = domain ? decodeURIComponent(req.query.domain) : undefined;
  const SEARCH_WORD = search ? decodeURIComponent(req.query.search) : undefined;

  if (!START_URL || !SEARCH_WORD) {
    return res.send("Missing params.");
  }

  // set filename to hostname + timestamp
  const protocol = START_URL.indexOf("http") > -1 ? "" : "http://";
  const url = new URL(protocol + START_URL);
  const filename = url.hostname + "_" + Date.now() + ".json";

  const response = await scrape(filename, SEARCH_WORD, url.href);

  // response
  if (response == 0) {
    const results = require(`${__dirname}/stsc/feed/${filename}`);

    res.header("Content-Type", "application/json");
    res.json(results);
  } else {
    res.send("error");
    error(response);
  }
});

/* FUNCTIONS */

// run scrapy via child_process
const scrape = (filename, string, url) => {
  const command = `${__dirname}/scrape.sh`;
  const args = [filename, string, url];
  const shell = spawn(command, args);
  return new Promise((resolve) => {
    shell.stderr.on("data", (data) => {
      resolve(data);
    });
    shell.on("close", (code) => {
      resolve(code);
    });
  });
};

// TODO error reporting
const error = (message) => {
  console.log(message);
};
