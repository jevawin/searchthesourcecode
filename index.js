/* DEPENDENCIES */
const express = require("express");
const shell = require("shelljs");

/* SERVER */

// configuration
const app = express();
const port = process.env.PORT || 8080;

// start server
app.listen(port);
console.log("Server started! At http://localhost:" + port)

// listen for input
app.get('/', (req, res) => {
  const { domain, search } = req.query
  // search parameters
  const START_URL = domain ? decodeURIComponent(req.query.domain) : undefined;
  const SEARCH_WORD = search ? decodeURIComponent(req.query.search) : undefined;

  if (!START_URL || !SEARCH_WORD) {
    return res.send('Missing params.')
  }

  const code = scrape(SEARCH_WORD, START_URL)

  // response
  if (code === 0) {
    const results = require('./searchthesourcecode/feed/searchthesourcecode.json')
    
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(results));
  } else {
    res.send('error')
  }
});

/* FUNCTIONS */

// run scrapy via shelljs
const scrape = (string, url) => {
  const response = shell.exec(`./scrape.sh '${string}' '${url}'`)
  return response.code
};

// TODO error reporting
const error = (message) => {
  console.log(message);
};
