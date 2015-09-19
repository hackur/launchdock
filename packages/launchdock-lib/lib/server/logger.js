/**
 * Global logging config
 */

var winston = Npm.require('winston');
Npm.require('winston-loggly');

Logger = new winston.Logger();

// default console transport
Logger.add(winston.transports.Console, {
  level: process.env.LAUNCHDOCK_LOG_LEVEL || 'info',
  timestamp: true,
  colorize: true,
  prettyPrint: true
});

// only include Loggly transport in production
if (process.env.NODE_ENV === 'production') {
  Logger.add(winston.transports.Loggly, {
    token: process.env.LOGGLY_TOKEN,
    subdomain: process.env.LOGGLY_SUBDOMAIN,
    level: 'info',
    json: true
  });
}

