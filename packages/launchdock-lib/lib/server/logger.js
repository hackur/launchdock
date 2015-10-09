/**
 * Global logging config
 */

// Using ongoworks:bunyan-logger
// https://atmospherejs.com/ongoworks/bunyan-logger

// https://www.npmjs.com/package/bunyan-loggly
var Bunyan2Loggly = Npm.require('bunyan-loggly').Bunyan2Loggly;

var logLevel = process.env.LAUNCHDOCK_LOG_LEVEL || "INFO";

if (process.env.VELOCITY_CI === "1") {
  formatOut = process.stdout;
} else {
  formatOut = logger.format({
    levelInString: false
  });
}

// default console config
var streams = [{
  level: 'info',
  stream: logLevel !== "DEBUG" ? formatOut : process.stdout,
}]

// Loggly config (only used in production)
var logglyStream = {
  type: 'raw',
  stream: new Bunyan2Loggly({
    token: process.env.LOGGLY_TOKEN,
    subdomain: process.env.LOGGLY_SUBDOMAIN,
  })
}

// if (process.env.NODE_ENV === "production") {
  streams.push(logglyStream);
// }

// create default logger instance
Logger = logger.bunyan.createLogger({
  name: "Launchdock",
  streams: streams
});

Logger.level(logLevel);
