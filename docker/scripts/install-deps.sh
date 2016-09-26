#!/bin/bash

set -e


printf "\n[-] Installing base OS dependencies...\n\n"

apt-get update

# install all app deps
apt-get install -y --no-install-recommends \
  apt-transport-https \
  build-essential \
  ca-certificates \
  curl \
  python


# install Docker
apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
echo "deb https://apt.dockerproject.org/repo debian-jessie main" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-engine

# start Docker
service docker start

# start on reboot
systemctl enable docker

# install Docker Machine
curl -L https://github.com/docker/machine/releases/download/v${DOCKER_MACHINE_VERSION}/docker-machine-`uname -s`-`uname -m` \
  > /usr/local/bin/docker-machine

chmod +x /usr/local/bin/docker-machine
