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
app.get('/', (req, res) => {
  const { domain, search } = req.query
  // search parameters
  const START_URL = domain ? decodeURIComponent(req.query.domain) : undefined;
  const SEARCH_WORD = search ? decodeURIComponent(req.query.search) : undefined;

  if (!START_URL || !SEARCH_WORD) {
    return res.send('Missing params. Get to fuck.')
  }

  const result = scrape(SEARCH_WORD, START_URL)
  
  // response
  if (result === 0) {
    res.send('success')
  } else {
    res.send('error')
  }
});

/* FUNCTIONS */

// run scrapy via shelljs
const scrape = (string, url) => {
  const result = shell.exec(`./scrape.sh '${string}' '${url}'`)

  return result.code
};

// TODO error reporting
const error = (message) => {
  console.log(message);
};
