#!/bin/bash

set -ex

mkdir -p tmp

if [! -d "tmp/faltest"]; then
  (cd tmp \
    && git clone https://github.com/NullVoxPopuli/faltest.git \
    && cd faltest \
    && git checkout updates \
    && yarn \
  )
fi

atFaltest="tmp/faltest/packages/"

( cd "$atFaltest/cli" && yarn link )
( cd "$atFaltest/lifecycle" && yarn link )
( cd "$atFaltest/page-objects" && yarn link )
( cd "$atFaltest/browser" && yarn link )
( cd "$atFaltest/chai" && yarn link )
( cd "$atFaltest/mocha" && yarn link )
( cd "$atFaltest/remote" && yarn link )
( cd "$atFaltest/utils" && yarn link )

yarn link @faltest/cli
yarn link @faltest/lifecycle
yarn link @faltest/page-objects
yarn link @faltest/browser
yarn link @faltest/chai
yarn link @faltest/mocha
yarn link @faltest/remote
yarn link @faltest/utils
