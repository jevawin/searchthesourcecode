#!/bin/bash
echo "Running spider..."
cd stsc
mkdir -p feed
mkdir -p logs
scrapy crawl searchthesourcecode --output "./feed/$1" -a query=$2 -a start=$3
echo "Done. Results logged to: ./stsc/feed/$1"