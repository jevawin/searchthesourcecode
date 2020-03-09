#!/bin/bash
clear && scrapy crawl header_spider --output "feed/%(name)s.json" --output-format json -a query='<!DOCTYPE html>'