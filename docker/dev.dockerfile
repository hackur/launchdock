FROM debian:jessie
MAINTAINER Jeremy Shimko <jeremy@reactioncommerce.com>

ENV DEV_BUILD "true"

ENV NODE_VERSION "4.5.0"

# Install MongoDB
ENV INSTALL_MONGO_TOOLS "false"
ENV MONGO_MAJOR "3.2"
ENV MONGO_VERSION "3.2.9"

# Meteor environment variables
ENV PORT "80"

# build script directories
ENV APP_SOURCE_DIR "/var/src"
ENV APP_BUNDLE_DIR "/var/www"
ENV BUILD_SCRIPTS_DIR "/opt/meteor"

# Install entrypoint and build scripts
COPY docker/scripts $BUILD_SCRIPTS_DIR

RUN chmod -R +x $BUILD_SCRIPTS_DIR

# install base dependencies
RUN bash $BUILD_SCRIPTS_DIR/install-deps.sh && \
		bash $BUILD_SCRIPTS_DIR/install-mongodb.sh && \
		bash $BUILD_SCRIPTS_DIR/install-node.sh && \
		bash $BUILD_SCRIPTS_DIR/install-meteor.sh

# copy the app to the container, build it, cleanup
COPY . $APP_SOURCE_DIR

RUN cd $APP_SOURCE_DIR && \
		bash $BUILD_SCRIPTS_DIR/build-meteor.sh && \
		bash $BUILD_SCRIPTS_DIR/post-build-cleanup.sh

# switch to production meteor bundle
WORKDIR $APP_BUNDLE_DIR/bundle

EXPOSE 80

# start mongo and reaction
ENTRYPOINT ["./entrypoint.sh"]
CMD []
