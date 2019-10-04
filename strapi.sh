#!/bin/sh
set -ea

_stopStrapi() {
  echo "Stopping strapi"
  kill -SIGINT "$strapiPID"
  wait "$strapiPID"
}

trap _stopStrapi TERM INT

cd /usr/src/app

npm install --prefix ./database

cd database

echo "Building strapi backend!"
npm run build

# strapi develop &
#strapi start &

#strapiPID=$!
#wait "$strapiPID"
