
// custom Launchdock logger for percolate:migrations
const launchdockLogger = (opts) => {
  const MigrationsLogger = Logger.child({ meteor_package: "percolate:migrations" });

  switch (opts.level) {
    case "info":
      MigrationsLogger.info(`[Migrations]: ${opts.message}`);
      break;
    case "warn":
      MigrationsLogger.warn(`[Migrations]: ${opts.message}`);
      break;
    case "error":
      MigrationsLogger.error(`[Migrations]: ${opts.message}`);
      break;
    case "debug":
      MigrationsLogger.debug(`[Migrations]: ${opts.message}`);
      break;
  }
}


// Configure percolate:migrations
Migrations.config({
  log: true,
  logger: launchdockLogger,
  logIfLatest: true,
  collectionName: "migrations"
});
