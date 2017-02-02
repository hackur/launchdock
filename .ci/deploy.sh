#!/bin/bash

set -e

docker tag reactioncommerce/launchdock:latest reactioncommerce/launchdock:$CIRCLE_TAG

docker login -e $DOCKER_EMAIL -u $DOCKER_USER -p $DOCKER_PASS

docker push reactioncommerce/launchdock:$CIRCLE_TAG
docker push reactioncommerce/launchdock:latest
