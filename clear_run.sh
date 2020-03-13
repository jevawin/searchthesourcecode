#!/bin/bash
clear
echo "Running spider..."
mkdir -p searchthesourcecode/feed
mkdir -p searchthesourcecode/logs
true > searchthesourcecode/feed/searchthesourcecode.json
cd searchthesourcecode
scrapy crawl searchthesourcecode --output "feed/%(name)s.json" --output-format json -a query=$1 -a start=$2