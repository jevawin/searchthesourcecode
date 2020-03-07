/* TO DO
 *
 * Configure database https://fauna.com
 * 
 */

/* Variables */
var
  // Dependencies
  request = require('request'),
  cheerio = require('cheerio'),
  URL = require('url-parse'),
  express = require('express'),
  escape = require('escape-html')
//Promise = require('promise'),

// Configuration
app = express(),
  port = process.env.PORT || 8080,

  // App variables
  pagesVisited = {},
  numPagesVisited = 0,
  pagesToVisit = [],
  instances = {};

/* Start server */
app.listen(port);
console.log('Server started! At http://localhost:' + port);


/* Listen for input */
app.get('/', function (req, res) {
  // Search parameters
  START_URL = decodeURIComponent(req.param('domain'));
  SEARCH_WORD = decodeURIComponent(req.param('query'));
  MAX_PAGES_TO_VISIT = 100;

  var loc = (/^https?/i.test(START_URL)) ? START_URL : 'http://' + START_URL;
  var options = {
    // Add http if it wasn't included
    url: loc,
    followRedirect: function (response) {
      // Update loc with new location to return
      loc = response.headers.location;

      return true;
    }
  };
  var baseURL;

  // Validate and correct URL
  request(options, function () {
    url = new URL(loc),
      baseURL = url.protocol + "//" + url.hostname;

    // Initiate crawl
    pagesToVisit.push(loc);
    crawl();
  });

  function crawl() {
    if (numPagesVisited >= MAX_PAGES_TO_VISIT) {
      results();
    }

    var nextPage = pagesToVisit.pop();

    if (nextPage in pagesVisited) {
      // We've already visited this page, so repeat the crawl
      crawl();
    } else if (nextPage !== undefined) {
      // New page we haven't visited
      visitPage(nextPage, crawl);
    } else {
      // We're at the end, pass results
      results();
    }
  }

  function visitPage(url, callback) {
    // Add page to our set
    pagesVisited[url] = true;
    numPagesVisited++;

    // Make the request
    console.log("Visiting page " + url);
    request(url, function (error, response, body) {
      // Check status code (200 is HTTP OK)
      if (response.statusCode !== 200) {
        callback();
        return;
      }

      // Parse the document body
      var $ = cheerio.load(body);
      var isWordFound = searchForWord(body, SEARCH_WORD);
      if (typeof (isWordFound) !== undefined) {
        instances[url] = isWordFound;
      }
      collectInternalLinks($);
      // In this short program, our callback is just calling crawl()
      callback();
    });
  }

  function searchForWord($, word) {
    var
      bodyText = $.toLowerCase().replace(/\r?\n|\r/g, ""),
      indexes = [],
      i = -1;

    while ((i = bodyText.indexOf(word.toLowerCase(), i + 1)) != -1) {
      indexes.push(i);
    }

    return indexes;
  }

  function collectInternalLinks($) {
    var relativeLinks = $("a[href^='/']");

    relativeLinks.each(function () {
      pagesToVisit.push(baseURL + $(this).attr('href'));
    });
  }

  function results() {
    res.send("stsc('" + JSON.stringify(instances) + "')");

    // Clear
    pagesVisited = {};
    numPagesVisited = 0;
    pagesToVisit = [];
    instances = {};

    return;
  }
});
