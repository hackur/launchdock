
Meteor.startup(function() {

  // import default wildcard pem file 
  let cert;
  try {
    cert = Assets.getText("certs/wildcard.pem");
    Launchdock.config.defaultWildcardCert = cert.replace(/(?:\r\n|\r|\n)/g, '\\n');
  } catch(err) {
    Logger.warn("No default wildcard pem file found at /private/certs/wildcard.pem");
  }

  // schedule database backups in production
  if (Launchdock.isProduction()) {

    // custom logger for percolate:synced-cron
    const SyncedCronLogger = (opts) => {
      const CronLogger = Logger.child({ meteor_package: "percolate:synced-cron" });

      switch (opts.level) {
        case "info":
          CronLogger.info(opts.message);
          break;
        case "warn":
          CronLogger.warn(opts.message);
          break;
        case "error":
          CronLogger.error(opts.message);
          break;
        case "debug":
          CronLogger.debug(opts.message);
          break;
      }
    }

    SyncedCron.config({
      logger: SyncedCronLogger
    });

    // backup on startup
    MongoTools.backup();

    // backup the database every 6 hours
    MongoTools.scheduleBackup("every 6 hours");

  }

  // setup Kadira if credentials exist
  const kadiraAppId = Settings.get("kadiraAppId");
  const kadiraAppSecret = Settings.get("kadiraAppSecret");

  if (!kadiraAppId || !kadiraAppSecret) {
    Logger.warn("No Kadira credentials found.  Not starting.");
  } else {
    Kadira.connect(kadiraAppId, kadiraAppSecret);
  }

});
