import scrapy
from scrapy.linkextractors.lxmlhtml import LxmlLinkExtractor
from six.moves.urllib.parse import urlparse
import re
import json
import sys


def find_text(body, query):
  result = [r.start() for r in re.finditer(re.escape(query), body)]
  return result


class SearchTheSourceCode(scrapy.Spider):
  name = 'searchthesourcecode'

  def __init__(self, **kw):
    super(SearchTheSourceCode, self).__init__(**kw)
    url = kw.get('start')
    if not url.startswith('http://') and not url.startswith('https://'):
      url = 'https://%s/' % url
    self.url = url
    self.allowed_domains = [re.sub(r'^www\.', '', urlparse(url).hostname)]

  def start_requests(self):
    yield scrapy.Request(self.url, callback=self.parse)

  def parse(self, response):
    url = response.url
    body = response.text
    matches = find_text(body, self.query)
    count = len(matches)

    yield {
        'url': url,
        'matches': json.dumps(matches),
        'count': count
    }

    trending_links = LxmlLinkExtractor(
        allow=r'^http', deny=r'\?', unique=True).extract_links(response)

    for next_page in trending_links:
      yield response.follow(next_page, self.parse)
