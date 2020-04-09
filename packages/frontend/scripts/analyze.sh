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
# ember-auto-import.json was not a part of
# broccoli-concat-analyzer, so that file needs
# to be stitched into the index.html file
CONCAT_STATS=true yarn build:production



# begin analysis
# yarn bundle-analyze

# copy to public folder for deployment
cp ./concat-stats-for/index.html ./public/bundle.html
