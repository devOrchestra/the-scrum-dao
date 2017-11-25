#!/bin/bash
set -e


if [ "$1" = 'migrate' ]
  then
    echo "Running migration ..."
    npm run migrate
elif [ "$1" = 'start-server' ]
  then
    echo "Starting server ..."
    npm run start
else
  echo "Valid argument is not provided."
fi
