#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEFAULT_FEATURE_DIR="${DEFAULT_FEATURE_DIR:-docs/features/SL-FE-GOV-PILOT}"

strip_wrapping() {
  local value="$1"
  value="${value#\`}"
  value="${value%\`}"
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
  parsed_feature_dir="$(
    node - <<'NODE'
const fs = require('fs')

const eventPath = process.env.GITHUB_EVENT_PATH
const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'))
const body = event.pull_request?.body || event.issue?.body || ''

const normalize = (value) => value.replace(/[`"]/g, '').trim()
const pathMatch =
  body.match(/Feature 文档:\s*([^\n\r]+)/i) ||
  body.match(/docs\/features\/[A-Za-z0-9._-]+/i)

if (pathMatch) {
  const raw = normalize(pathMatch[1] || pathMatch[0])
  const directPath = raw.match(/docs\/features\/[A-Za-z0-9._-]+/i)
  if (directPath) {
    process.stdout.write(directPath[0])
    process.exit(0)
  }
}

const idMatch = body.match(/Feature ID:\s*`?([A-Za-z0-9._-]+)`?/i)
if (idMatch) {
  process.stdout.write(`docs/features/${normalize(idMatch[1])}`)
}
NODE
  )"

  print_if_valid "${parsed_feature_dir}"
fi

print_if_valid "${DEFAULT_FEATURE_DIR}"

echo "unable to resolve feature directory" >&2
exit 1
