#!/bin/bash

CONCEPT=$1
CC_PATH=$2
GUI=$3

[ -z "$CONCEPT" ] && echo "first argument must be core concept name eg. hello_holo" && exit 1

if [ ! $CC_PATH ]; then
  hc init
  CC_PATH=cc_tuts
fi

single_source code src/tutorials/coreconcepts/$CONCEPT.md ${CC_PATH}zomes/hello/code/src/lib.rs rust
single_source code src/tutorials/coreconcepts/$CONCEPT.md ${CC_PATH}test/index.js javascript test

if [ $GUI ]; then
  single_source code src/tutorials/coreconcepts/$CONCEPT.md ${GUI}/index.html html gui
  single_source code src/tutorials/coreconcepts/$CONCEPT.md ${GUI}/hello.js javascript gui
fi
