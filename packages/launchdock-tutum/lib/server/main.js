
Logger = Logger.child({ meteor_package: 'launchdock:tutum' });


/*
 * Tutum methods/helpers for Launchdock 
 */
Launchdock.tutum = {};

// just a placeholder until load balancer management is built
Launchdock.tutum.getLoadBalancerEndpoint = function (stackId) {
  return "us1.lb.launchdock.io";
};
