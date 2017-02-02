#!/bin/bash

set -e

# build new base and app images
docker build -t reactioncommerce/launchdock:latest .

# run the container and wait for it to boot
docker-compose -f .ci/docker-compose.yml up -d
sleep 30

# use curl to ensure the app returns 200's
curl --retry 10 --retry-delay 10 -v http://localhost:3000
