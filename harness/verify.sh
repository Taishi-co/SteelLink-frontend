#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "${ROOT_DIR}"

echo "== Verify =="

echo "[1/3] required governance files"
required_files=(
  "AGENTS.md"
  "CLAUDE.md"
  "docs/ai/entrypoint.md"
  "docs/ai/project-map.md"
  "docs/ai/engineering-rules.md"
  "docs/ai/git-workflow.md"
  "docs/ai/review-rules.md"
  "docs/ai/release-rules.md"
  "docs/domain/role-permission-matrix.md"
  "docs/features/_template/spec.md"
  "docs/features/_template/test-cases.md"
  "docs/features/_template/implementation-plan.md"
  "docs/features/_template/release-checklist.md"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "${file}" ]]; then
    echo "missing required file: ${file}" >&2
    exit 1
  fi
done
echo "required governance files are present"
echo

echo "[2/3] harness shell syntax"
for script in harness/*.sh; do
  env -u LC_ALL bash -n "${script}"
done
echo "harness scripts passed shell syntax check"
echo

echo "[3/3] optional app verification"
if [[ -f "package.json" ]]; then
  echo "package.json detected"
  echo "running npm run lint"
  npm run lint
  echo
  echo "running npm run build"
  npm run build
else
  echo "package.json not found; skipping npm run lint and npm run build"
fi
echo
echo "verify passed"
