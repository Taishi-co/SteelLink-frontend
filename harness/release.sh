#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FEATURE_DIR="${1:-}"

if [[ -z "${FEATURE_DIR}" ]]; then
  FEATURE_DIR="$("${ROOT_DIR}/harness/resolve-feature-dir.sh")"
fi

cd "${ROOT_DIR}"

for file in spec.md test-cases.md implementation-plan.md release-checklist.md; do
  if [[ ! -f "${FEATURE_DIR}/${file}" ]]; then
    echo "missing required release artifact: ${FEATURE_DIR}/${file}" >&2
    exit 1
  fi
done

echo "== Release Gate =="
echo "feature: ${FEATURE_DIR}"
./harness/verify.sh
echo "release artifacts present"
if [[ -f "package.json" ]]; then
  echo "application workspace detected; confirm release dependencies in ${FEATURE_DIR}/release-checklist.md"
else
  echo "governance workspace detected; real application deployment remains an external dependency"
fi
echo
echo "release gate passed"
