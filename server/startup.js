
Meteor.startup(function() {

  // schedule database backups in production
  if (process.env.NODE_ENV === "production") {

    // custom logger for percolate:synced-cron
    var SyncedCronLogger = function (opts) {
      var CronLogger = Logger.child({ meteor_package: 'percolate:synced-cron' });

      switch (opts.level) {
        case 'info':
          CronLogger.info(opts.message);
          break;
        case 'warn':
          CronLogger.warn(opts.message);
          break;
        case 'error':
          CronLogger.error(opts.message);
          break;
        case 'debug':
          CronLogger.debug(opts.message);
          break;
      }
    }

    SyncedCron.config({
      logger: SyncedCronLogger
    });

    MongoTools.config({
      s3: {
        key: Settings.get('awsKey'),
        secret: Settings.get('awsSecret'),
        bucket: 'reaction-dumps-devel',
        path: "launchdock-dev/"
      }
    });

    // backup on startup
    MongoTools.backup();

    // backup the database every 6 hours
    MongoTools.scheduleBackup("every 6 hours");

  }

});
