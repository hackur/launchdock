
Logger = Logger.child({ meteor_package: 'launchdock:accounts-reaction' });

/**
 * Reaction Drive config
 */
Launchdock.config.drive = {
  url() {
    const settings = Meteor.settings.public.drive;
    if (settings && settings.url) {
      return settings.url
    } else {
      return "https://reactioncommerce.com/"
    }
  }
}
