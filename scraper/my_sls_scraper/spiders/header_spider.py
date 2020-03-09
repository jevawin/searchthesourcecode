import scrapy
from scrapy.linkextractors.lxmlhtml import LxmlLinkExtractor
import re
import json


def netball_team(body):
    query = "[.+?]"
    # result = [r.start() for r in re.finditer(re.escape(query), body)]
    result = [r.start() for r in re.finditer(query, body)]
    return result


class HeaderSpider(scrapy.Spider):
    name = 'header_spider'
    start_urls = ['https://www.hillarys.co.uk']
    allowed_domains = ['hillarys.co.uk']

    def parse(self, response):
        url = response.url
        body = response.text
        matches = netball_team(body)
        count = len(matches)

        # yield {'url': response.url, 'response': response.text}
        yield {
            'url': url,
            'matches': json.dumps(matches),
            'count': count
        }

        trending_links = LxmlLinkExtractor(
            allow=r'^http', deny=r'\?', unique=True).extract_links(response)

        for next_page in trending_links:
            yield response.follow(next_page, self.parse)
