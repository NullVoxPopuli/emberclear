#!/bin/bash

R="\e[31m"
Y="\e[33m"
N="\e[0m"

yarn build:production:analyze

# rm files that do not have corresponding folders
for filename in ./concat-stats-for/*; do
  extension=${filename: -5}

  if [ $extension == ".json" ]; then
    folderName="${filename//$extension/}"

    if [ ! -d "$folderName" ]; then
      echo -e "\n${Y}$folderName ${R} does not exist..."
      echo -e "\tDeleting ${Y}$filename${N}\n"

      rm $filename
    fi
  fi
done

# begin analysis
yarn bundle-analyze

# copy to public folder for deployment
cp ./concat-stats-for/index.html ./public/bundle.html
