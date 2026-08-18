#!/bin/sh
# Creates the upload bucket on first start and leaves it private.
#
# Uploads are pre-signed, so the bucket is never public: the API hands the client
# a signed URL and the bytes go straight to storage without transiting the API.
set -eu

ALIAS="local"
ENDPOINT="http://objectstore:9000"
BUCKET="${S3_BUCKET:-relay-uploads}"
ACCESS_KEY="${S3_ACCESS_KEY_ID:-relay_local_access}"
SECRET_KEY="${S3_SECRET_ACCESS_KEY:-relay_local_secret}"

attempt=1
until mc alias set "$ALIAS" "$ENDPOINT" "$ACCESS_KEY" "$SECRET_KEY" >/dev/null 2>&1; do
  if [ "$attempt" -ge 30 ]; then
    echo "object storage did not become reachable at $ENDPOINT after $attempt attempts" >&2
    exit 1
  fi
  echo "waiting for object storage at $ENDPOINT (attempt $attempt)"
  attempt=$((attempt + 1))
  sleep 2
done

mc mb --ignore-existing "$ALIAS/$BUCKET"
mc anonymous set none "$ALIAS/$BUCKET"

# Uploads that were started and never completed are cleaned up rather than
# accumulating in local development.
mc ilm rule add --expire-delete-marker "$ALIAS/$BUCKET" >/dev/null 2>&1 || true

echo "bucket $BUCKET is ready and private"
