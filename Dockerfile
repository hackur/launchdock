
FROM meteorhacks/meteord:onbuild

# Add mongodb-org-tools for mongodump dependency
ENV MONGO_MAJOR 3.0
ENV MONGO_VERSION 3.0.7

RUN apt-key adv --keyserver ha.pool.sks-keyservers.net --recv-keys 492EAFE8CD016A07919F1D2B9ECBEC467F0CEB10
RUN echo "deb http://repo.mongodb.org/apt/debian wheezy/mongodb-org/$MONGO_MAJOR main" > /etc/apt/sources.list.d/mongodb-org.list
RUN set -x \
  && apt-get update \
  && apt-get install -y \
    mongodb-org-tools=$MONGO_VERSION \
  && rm -rf /var/lib/apt/lists/* \
  && rm -rf /var/lib/mongodb