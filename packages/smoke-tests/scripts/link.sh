#!/bin/bash

set -ex

mkdir -p tmp

(cd tmp && git clone https://github.com/NullVoxPopuli/faltest.git && cd faltest && git checkout updates )

atFaltest="tmp/faltest/packages/"

( cd "$atFaltest/cli" && yarn link )
( cd "$atFaltest/lifecycle" && yarn link )
( cd "$atFaltest/page-objects" && yarn link )

yarn link @faltest/cli
yarn link @faltest/lifecycle
yarn link @faltest/page-objects
