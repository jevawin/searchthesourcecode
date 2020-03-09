#!/bin/bash
clear && rm feed/header_spider.json && scrapy crawl header_spider --output "feed/%(name)s.json" --output-format json -a query='<!DOCTYPE html>'