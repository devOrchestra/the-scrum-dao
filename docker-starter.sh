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
elif [ "$1" = 'init-contracts' ]
  then
    echo "Running contracts initialization ..."
    npm run init-contracts
else
  echo "Valid argument is not provided."
fi
