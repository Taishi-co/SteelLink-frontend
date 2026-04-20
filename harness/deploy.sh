#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_ENV="${1:-}"

if [[ "${TARGET_ENV}" != "staging" && "${TARGET_ENV}" != "prod" ]]; then
  echo "usage: ./harness/deploy.sh <staging|prod>" >&2
  exit 1
fi

cd "${ROOT_DIR}"

echo "== Deploy Plan =="
echo "target environment: ${TARGET_ENV}"

if [[ "${DEPLOY_EXECUTE:-0}" != "1" ]]; then
  echo "dry-run mode"
  echo "this governance repository does not perform a real frontend deployment locally"
  echo "use the paired application repository or CI/CD pipeline for actual staging/prod rollout"
  exit 0
fi

echo "no local deployment steps are defined in this governance repository"
echo "treat this as an orchestration handoff to the paired application repository or CI/CD"
