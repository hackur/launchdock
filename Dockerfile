FROM jshimko/meteor-launchpad:latest

ENV DOCKER_MACHINE_VERSION 0.8.1

# install Docker and Docker Machine
RUN apt-get update && \
    apt-get install -y --no-install-recommends apt-transport-https ca-certificates && \
    apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D && \
    echo "deb https://apt.dockerproject.org/repo debian-jessie main" > /etc/apt/sources.list.d/docker.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends docker-engine && \
    service docker start && \
    systemctl enable docker && \
    curl -L https://github.com/docker/machine/releases/download/v${DOCKER_MACHINE_VERSION}/docker-machine-`uname -s`-`uname -m` \
      > /usr/local/bin/docker-machine && \
    chmod +x /usr/local/bin/docker-machine && \
    apt-get -y purge apt-transport-https && \
    rm -rf /var/lib/apt/lists/*
