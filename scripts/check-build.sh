#!/usr/bin/env bash

echo Checking if ./lib is in sync with ./src...
npm run-script build >/dev/null
DIFF=$(git diff --name-only)
[[ -n ${DIFF} ]] && echo FAIL && exit 1
echo OK
