#!/bin/sh
set -ea

_stopStrapi() {
  echo "Stopping strapi"
  kill -SIGINT "$strapiPID"
  wait "$strapiPID"
}

trap _stopStrapi TERM INT

cd /usr/src/app

APP_NAME=database
DATABASE_CLIENT=${DATABASE_CLIENT:-mysql}
DATABASE_HOST=${DATABASE_HOST:-localhost}
DATABASE_PORT=${DATABASE_PORT:-3306}
DATABASE_NAME=${DATABASE_NAME:-strapi}
DATABASE_SRV=${DATABASE_SRV:-false}
EXTRA_ARGS=${EXTRA_ARGS:-}
DATABASE_USERNAME=secret
DATABASE_PASSWORD=secret

if [ ! -f "$APP_NAME/package.json" ]
then
	strapi new database --dbclient=$DATABASE_CLIENT --dbhost=$DATABASE_HOST --dbport=$DATABASE_PORT --dbsrv=$DATABASE_SRV --dbname=$DATABASE_NAME --dbusername=$DATABASE_USERNAME --dbpassword=$DATABASE_PASSWORD --dbssl=$DATABASE_SSL -- $EXTRA_ARGS
elif [ ! -d "$APP_NAME/node_modules" ]
then
    npm install --prefix ./$APP_NAME
fi

cd database

echo "Building strapi backend!"
npm run build

strapi develop &
#strapi start &

#strapiPID=$!
#wait "$strapiPID"
