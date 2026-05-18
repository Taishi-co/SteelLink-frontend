#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEFAULT_FEATURE_DIR="${DEFAULT_FEATURE_DIR:-docs/features/SL-FE-GOV-PILOT}"

strip_wrapping() {
  local value="$1"
  local backtick
  backtick="$(printf '\140')"
  value="${value#${backtick}}"
  value="${value%${backtick}}"
  value="${value#\"}"
  value="${value%\"}"
  printf '%s' "${value}"
}

print_if_valid() {
  local candidate="$1"
  if [[ -n "${candidate}" && -d "${ROOT_DIR}/${candidate}" ]]; then
    printf '%s\n' "${candidate}"
    exit 0
  fi
}

if [[ -n "${FEATURE_DIR:-}" ]]; then
  print_if_valid "$(strip_wrapping "${FEATURE_DIR}")"
fi

if [[ -n "${FEATURE_ID:-}" ]]; then
  print_if_valid "docs/features/$(strip_wrapping "${FEATURE_ID}")"
fi

if [[ -n "${GITHUB_EVENT_PATH:-}" && -f "${GITHUB_EVENT_PATH}" ]]; then
  event_body="$(
    node -e 'const fs = require("fs"); const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8")); process.stdout.write((event.pull_request && event.pull_request.body) || (event.issue && event.issue.body) || "")'
  )"
  parsed_feature_dir="$(printf '%s' "${event_body}" | grep -Eo 'docs/features/[A-Za-z0-9._-]+' | head -n 1 || true)"
  if [[ -z "${parsed_feature_dir}" ]]; then
    parsed_feature_id="$(printf '%s' "${event_body}" | sed -nE 's/.*Feature ID:[[:space:]]*"?([A-Za-z0-9._-]+)"?.*/\1/ip' | head -n 1 || true)"
    if [[ -n "${parsed_feature_id}" ]]; then
      parsed_feature_dir="docs/features/$(strip_wrapping "${parsed_feature_id}")"
    fi
  fi

  print_if_valid "${parsed_feature_dir}"
fi

print_if_valid "${DEFAULT_FEATURE_DIR}"

echo "unable to resolve feature directory" >&2
exit 1
