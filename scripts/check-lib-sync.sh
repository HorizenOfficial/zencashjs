#!/usr/bin/env bash

diff_in_dir() {
  TARGET_BRANCH=${TARGET_BRANCH:-master}
  DIFF=$(git diff --name-only origin/"$TARGET_BRANCH" "$1")
  for FILE in $DIFF; do
    basename "$FILE"
  done
}

echo Checking if ./lib is in sync with ./src...
SRC_DIFF=$(diff_in_dir src)
LIB_DIFF=$(diff_in_dir lib)

[[ "$SRC_DIFF" == "$LIB_DIFF" ]] && exit 0
exit 1
