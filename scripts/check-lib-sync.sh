#!/usr/bin/env bash

set -eEuo pipefail

diff_in_dir() {
  TARGET_BRANCH="${TARGET_BRANCH:-master}"
  DIFF="$(git diff --name-only origin/"$TARGET_BRANCH" "$1")"
  while read -r FILE; do
    # Ignore changes to src/types.js because it only has Flow type annotations and it does not compile to any vanilla Javascript
    if [ "$FILE" != "src/types.js" ]; then
      basename "$FILE"
    fi
  done <<< "${DIFF}"
}

echo Checking if ./lib is in sync with ./src...
SRC_DIFF="$(diff_in_dir src)"
LIB_DIFF="$(diff_in_dir lib)"

while read -r line; do
  grep -q "${line}" <<< "${LIB_DIFF}"
done <<< "${SRC_DIFF}"
