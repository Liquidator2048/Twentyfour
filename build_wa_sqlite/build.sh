#!/bin/bash
set -xe
cd "$( dirname "$0" )"
docker build --pull -t local/emsdk .
# -u "$(id -u):$(id -g)"
docker run --rm -ti \
  -u "$(id -u):$(id -g)" \
  -v "$(readlink -f ../src/wa-sqlite):/dist:rw,Z"  \
  local/emsdk \
  /run.sh /dist
