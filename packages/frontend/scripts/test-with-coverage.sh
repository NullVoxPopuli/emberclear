#!/bin/bash

export GIT_COMMIT_SHA=$GITHUB_SHA
export GIT_BRANCH=${GITHUB_REF#refs/heads/}
export COVERAGE=true

./cc-test-reporter before-build

time yarn test

# fix the paths, since we aren't generating coverage from
# the root of the mono repo
sed -i -E "s/^SF:(.+)$/SF:packages\/frontend\/\1/" coverage/lcov.info

./cc-test-reporter after-build -t lcov

# --add-prefix packages/frontend/ \
# ./cc-test-reporter format-coverage \
#   --debug \
#   --output ./coverage/coverage.json \
#   --input-type lcov coverage/lcov.info

# ./cc-test-reporter upload-coverage \
#   --debug \
#   --input ./coverage/coverage.json

yarn codecov
