#!/bin/bash

export GIT_COMMIT_SHA=$GITHUB_SHA
export GIT_BRANCH=${GITHUB_REF#refs/heads/}
export COVERAGE=true

time yarn test

exit_code=$?

# fix the paths, since we aren't generating coverage from
# the root of the mono repo
sed -i -E "s/^SF:(.+)$/SF:client\/web\/emberclear\/\1/" coverage/lcov.info
echo "Successfully fixed the test coverage paths!"

exit $exit_code
