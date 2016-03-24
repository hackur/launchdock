/**
 * Global logging config
 */
const bunyan = Npm.require("bunyan");
const bunyanFormat = Npm.require("bunyan-format");
const Bunyan2Loggly = Npm.require("bunyan-loggly").Bunyan2Loggly;

const logLevel = process.env.LAUNCHDOCK_LOG_LEVEL || "INFO";

// console output formatting
const formatOut = bunyanFormat({
  outputMode: "short"
});

// default console config
let streams = [{
  level: "info",
  stream: logLevel !== "DEBUG" ? formatOut : process.stdout
}];

// Loggly config (only used in production)
if (Launchdock.isProduction()) {
  const logglyToken = process.env.LOGGLY_TOKEN;
  const logglySubdomain = process.env.LOGGLY_SUBDOMAIN;

  if (logglyToken && logglySubdomain) {
    const logglyStream = {
      type: "raw",
      stream: new Bunyan2Loggly({
        token: logglyToken,
        subdomain: logglySubdomain
      })
    };
    streams.push(logglyStream);
  }
}

// create default logger instance
Logger = bunyan.createLogger({
  name: "Launchdock",
  streams: streams
});

// set default level
Logger.level(logLevel);


/**
 * Parse Meteor errors and return a string to log out
 * @param  {Object} error - the error object to parse
 * @return {String} the parsed error string
 */
Logger.parseError = (error) => {
  let result = "";

  if (error.message) {
    result += error.message + "; ";
  }

  if (error.reason) {
    result += error.reason + "; ";
  }

  if (error.details) {
    result += error.details;
  }

  if (!(result.length > 0)) {
    result = "No error details found";
  }

  return result;
};
