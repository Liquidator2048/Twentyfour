#!/bin/bash
[ -f .env ] && source .env
set -ex
EXPORT_FILE="${EXPORT_FILE:-./export.sqlite3}"
cd "$( dirname "$0" )"
[ -f "${EXPORT_FILE}" ] && rm "${EXPORT_FILE}"
sqlite3 -echo -bail "${EXPORT_FILE}"  ".read 'export_database.sql'"

ipfs $IPFS_OPT add "${EXPORT_FILE}"
