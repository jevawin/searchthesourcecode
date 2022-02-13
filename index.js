/* DEPENDENCIES */
const express = require("express");
const shell = require("shelljs");

/* SERVER */

// configuration
const app = express();
const port = process.env.PORT || 8080;

// start server
app.listen(port);
console.log("Server started! At http://localhost:" + port);

// listen for input
app.get("/", function (req, res) {
  // search parameters
  START_URL = decodeURIComponent(req.query.domain);
  SEARCH_WORD = decodeURIComponent(req.query.search);

  // run scrapy
  scrape(res, SEARCH_WORD, START_URL)
});

/* FUNCTIONS */

// run scrapy via shelljs
const scrape = (res, string, url) => {
  shell.exec(`./scrape.sh '${string}' '${url}'`, (code, out, err) => {
    if (err === 0) {
      res.send(code, out, err)
      shell.exit(0)
    } else {
      error(err)
      shell.exit(1)
    }

  });
};

// TODO error reporting
const error = (message) => {
  console.log(message);
};
