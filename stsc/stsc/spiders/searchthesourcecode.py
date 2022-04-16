import sys
import scrapy
from scrapy.linkextractors.lxmlhtml import LxmlLinkExtractor
from urllib.parse import urlparse
from urllib.parse import unquote
import re
import json

# regex find query in body
def find_text(body, query):
    sQuery = re.escape(' '.join(unquote(query).split()))
    sBody = ' '.join(body.split())
    result = [r.start() for r in re.finditer(sQuery, sBody, re.IGNORECASE)]
    return result

class SearchTheSourceCode(scrapy.Spider):
    name = 'searchthesourcecode'

    def __init__(self, **kw):
        super(SearchTheSourceCode, self).__init__(**kw)
        url = kw.get('start')
        if not url.startswith('http://') and not url.startswith('https://'):
            url = 'http://%s/' % url
        self.url = url
        self.allowed_domains = [re.sub(r'^www\.', '', urlparse(url).hostname)]

    def start_requests(self):
        yield scrapy.Request(self.url, callback=self.parse, errback=self.error)

    # error callback to handle inaccessible sites
    def error(self, failure):
        response = {
            "error": failure.value.response.status,
            "body": failure.value.response.body.decode("utf-8")
        }
        print(json.dumps(response), file=sys.stderr)

    # parse page, search for query, output to json
    def parse(self, response):
        # build json entry
        url = response.url
        url_no_host = re.match(
            "^(https?:\/\/[^:\/\s]+)(\/.*)$", response.url, re.IGNORECASE)
        body = ' '.join(response.text.split())
        matches = find_text(body, self.query)
        count = len(matches)
        if count > 0:
            snippet_start = max(0, matches[0] - 50)
            snippet_end = snippet_start + 100
            snippet = body[snippet_start:snippet_end]
        else:
            snippet = ""

        output = {
            'url': url,
            'hostless': url_no_host.group(2),
            'matches': json.dumps(matches),
            'count': count,
            'snippet': snippet
        }

        # send to json file
        yield output

        # find links
        trending_links = LxmlLinkExtractor(
            allow=r'^http', deny=r'\?', unique=True).extract_links(response)

        # follow links to next pages
        for next_page in trending_links:
            yield response.follow(next_page, self.parse)
