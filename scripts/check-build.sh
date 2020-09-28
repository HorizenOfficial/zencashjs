#!/usr/bin/env bash

npm run-script build
DIFF=$(git diff --name-only)
[[ -n ${DIFF} ]] && exit 1
