#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "== SteelLink Frontend Harness Bootstrap =="
echo "root: ${ROOT_DIR}"
if command -v node >/dev/null 2>&1; then
  echo "node: $(node --version)"
else
  echo "node: not installed"
fi
if command -v npm >/dev/null 2>&1; then
  echo "npm: $(npm --version)"
else
  echo "npm: not installed"
fi
if git -C "${ROOT_DIR}" rev-parse --show-toplevel >/dev/null 2>&1; then
  echo "git: worktree detected"
else
  echo "git: current workspace is not a git worktree"
fi
if [[ -f "${ROOT_DIR}/package.json" ]]; then
  echo "app: package.json detected"
else
  echo "app: docs/harness governance workspace"
fi
echo
echo "Read in order:"
echo "1. AGENTS.md"
echo "2. docs/ai/entrypoint.md"
echo "3. docs/ai/project-map.md"
echo "4. docs/ai/engineering-rules.md"
echo "5. docs/ai/git-workflow.md"
echo
echo "Key commands:"
echo "- ./harness/branch-guard.sh local"
echo "- ./harness/verify.sh"
echo "- ./harness/review.sh docs/features/<feature-id>"
echo "- ./harness/release.sh docs/features/<feature-id>"
echo "- ./harness/deploy.sh staging"
