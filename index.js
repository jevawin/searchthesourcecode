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
  const result = scrape(res, SEARCH_WORD, START_URL)

  // response
  if (result === 0) {
    res.send('success')
  } else {
    res.send('error')
  }
});

/* FUNCTIONS */

// run scrapy via shelljs
const scrape = (res, string, url) => {
  const result = shell.exec(`./scrape.sh '${string}' '${url}'`)
  return result.code
};

// TODO error reporting
const error = (message) => {
  console.log(message);
};
