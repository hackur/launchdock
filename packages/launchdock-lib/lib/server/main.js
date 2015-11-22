
/**
 * Check if we're running in production
 * @return {Boolean} true if NODE_ENV is 'production'
 */
Launchdock.isProduction = () => {
  return (process.env.NODE_ENV === 'production');
}
