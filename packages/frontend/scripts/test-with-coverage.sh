#!/bin/bash

export GIT_COMMIT_SHA=$GITHUB_SHA
export GIT_BRANCH=${GITHUB_REF#refs/heads/}

./cc-test-reporter before-build

time yarn test

./cc-test-reporter format-coverage \
  --debug \
  --add-prefix packages/frontend/ \
  --output ./coverage/coverage.json \
  --input-type lcov coverage/lcov.info

./cc-test-reporter upload-coverage \
  --debug \
  --input ./coverage/coverage.json
