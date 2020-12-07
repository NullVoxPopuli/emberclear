#!/bin/bash

R="\e[31m"
Y="\e[33m"
N="\e[0m"

# outputs the following files:
# - concats-stats-for/
#   - #-emberclear.js.json
#   - #-vendor.js.json
#   - #-vendor.css.json
#   - ember-auto-import.json
#
rm -rf public/bundle
# ember-auto-import.json was not a part of
# broccoli-concat-analyzer, so that file needs
# to be stitched into the index.html file
echo -e "${Y}Building App with Stats${N}"
# echo -e "${Y}Outputs:${N}"
# echo -e "${Y}- dist/bundle/crypto.html${N}"
# ^ There is currently now esbuild bundle analyzer
CONCAT_STATS=true yarn build:production

# begin analysis
echo -e "${Y}Analyzing Broccoli Output${N}"
echo -e "${Y}Outputs:${N}"
echo -e "${Y}- concat-stats-for/index.html${N}"
echo -e "${Y}- concat-stats-for/ember-auto-import.html${N}"
mkdir -p concat-stats-for/
node ./scripts/analyze-broccoli.js

# copy to public folder for deployment
# (we build again without CONCAT_STATS)
echo -e "${Y}Copying HTML Analysis files to public/bundle for later deployment/${N}"
mkdir -p ./public/bundle
cp ./concat-stats-for/index.html ./public/bundle/broccoli.html
cp ./concat-stats-for/ember-auto-import.html ./public/bundle/
# cp ./dist/bundle/* ./public/bundle/
