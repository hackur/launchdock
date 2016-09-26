FROM debian:jessie
MAINTAINER Jeremy Shimko <jeremy@reactioncommerce.com>

ENV NODE_VERSION "4.5.0"

# Docker
ENV DOCKER_MACHINE_VERSION "0.7.0"

# Install MongoDB
ENV INSTALL_MONGO_TOOLS "false"
ENV MONGO_MAJOR "3.2"
ENV MONGO_VERSION "3.2.9"

# Meteor environment variables
ENV PORT "80"
ENV ROOT_URL "http://localhost"

# build script directories
ENV APP_SOURCE_DIR "/var/src"
ENV APP_BUNDLE_DIR "/var/www"
ENV BUILD_SCRIPTS_DIR "/opt/meteor"

# Install entrypoint and build scripts
COPY docker/scripts $BUILD_SCRIPTS_DIR

RUN chmod -R +x $BUILD_SCRIPTS_DIR

# copy the app to the container
COPY . $APP_SOURCE_DIR

# install base dependencies, build app, cleanup
RUN bash $BUILD_SCRIPTS_DIR/install-deps.sh && \
		bash $BUILD_SCRIPTS_DIR/install-mongodb.sh && \
		bash $BUILD_SCRIPTS_DIR/install-node.sh && \
		bash $BUILD_SCRIPTS_DIR/install-meteor.sh && \
 		cd $APP_SOURCE_DIR && \
		bash $BUILD_SCRIPTS_DIR/build-meteor.sh && \
		bash $BUILD_SCRIPTS_DIR/post-build-cleanup.sh

# switch to production meteor bundle
WORKDIR $APP_BUNDLE_DIR/bundle

EXPOSE 80

# start mongo and reaction
ENTRYPOINT ["./entrypoint.sh"]
CMD []
