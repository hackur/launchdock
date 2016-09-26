#!/bin/bash

set -e

# set default meteor values if they arent set
: ${PORT:="80"}
: ${ROOT_URL:="http://localhost"}

# Run meteor
exec node ./main.js
