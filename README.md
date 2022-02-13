# Search the Source Code

Is a tool that finds snippets of source code on a website for you. It uses Scrapy, a Python library, to crawl a website you provide, parses the HTML for each URL it finds and searches that HTML for the snippet of code you provided.

For example, let's say you want to find out which pages on your site are running **jQuery**, you'd search for something like:

```
$(function() {
```

On `https://www.yoursite.com/`, and STSC would return the URLs it found that piece of code on.

You can search for anything you like, from a single character (you'll probably return a lot of URLs) to a full snippet of code.

Visit https://searchthesourcecode.com/ to try it out!

# Running locally

```
git clone git@github.com:jevawin/searchthesourcecode.git
cd searchthesourcecode
npm install
pip install scrapy
node index.js
```

Then access on http://localhost:8080/?domain=www.domaintosearch.com&search=encodedhtml