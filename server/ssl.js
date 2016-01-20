
Launchdock.ssl = {};

/**
 * Read the default wildcard pem file at /private/certs/wilcard.pem
 * @return {String} pem file contents
 */
Launchdock.ssl.getDefaultPem = function () {
  let pem;

  try {
    pem = Assets.getText("certs/wildcard.pem");
  } catch(err) {
    Logger.error("Error reading default wildcard cert at /private/certs/wilcard.pem");
    throw new Meteor.Error(err);
  }

  return pem;
};


Launchdock.ssl.getDefaultPemEnvVar = function () {
  const pem = this.getDefaultPem();

  // replace all new lines with "\n" for usage in environment variables
  return pem.replace(/(?:\r\n|\r|\n)/g, '\\n');
}
