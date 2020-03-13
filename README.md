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
./clear_run.sh 'CODE TO SEARCH FOR' 'WEBSITE_URL'
```

For example, if you wanted to look for jQuery's ready function on Google you'd run:

```
./clear_run.sh '$(function() {' 'https://www.google.com/'
```

The results are output to `feed/searchthesourcecode.json`.

By default, crawls are limited to 50 URLs. You can change this by editing `CLOSESPIDER_PAGECOUNT` in `settings.py`.