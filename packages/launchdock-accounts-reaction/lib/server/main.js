
Logger = Logger.child({ meteor_package: 'launchdock:accounts-reaction' });

/**
 * Reaction Drive config
 */
Launchdock.config.drive = {

  url() {
    const urlEnvVar = process.env.REACTION_DRIVE_URL;
    const settings = Meteor.settings.drive;

    if (urlEnvVar) {
      return urlEnvVar;
    } else if (settings && settings.url) {
      return settings.url;
    } else {
      return "https://reactioncommerce.com/";
    }
  }

}
