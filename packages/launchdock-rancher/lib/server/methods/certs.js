
Meteor.methods({

  'rancher/updateStackSSLCert'(stackId, options) {

    const logger = Logger.child({
      meteor_method: 'rancher/createCert',
      meteor_method_args: options,
      userId: this.userId
    });

    check(stackId, String);

    check(options, {
      name: String,
      description: Match.Optional(String),
      key: String,
      cert: String,
      certChain: Match.Optional(String)
    });

    const stack = Stacks.findOne(stackId);

    if (!stack) {
      const err = "Stack not found";
      logger.error(err);
      throw new Meteor.Error(err);
    }

    if (!Users.is.owner(this.userId, stack) && !Users.is.admin(this.userId)) {
      const err = "AUTH ERROR: Access denied";
      logger.error(err);
      throw new Meteor.Error(err);
    }

    const rancher = new Rancher();
    rancher.checkCredentials();

    // TODO: check for existing cert and do an update if one exists

    // create the new cert on Rancher
    let cert;
    try {
      cert = rancher.create("certificates", options);
    } catch(e) {
      const err = "Error adding certificate.";
      logger.error(err, e);
      throw new Meteor.Error(err);
    }

    // TODO: balancers to be managed in Launchdock
    const balancerId = Settings.get("rancherDefaultBalancer");

    if (!balancerId) {
      const err = "No default load balancer configured.";
      logger.error(err);
      throw new Meteor.Error(err);
    }

    // grab the current certs from the load balancer
    let lbCerts;
    try {
      const lb = rancher.get("loadbalancerservices", balancerId);
      lbCerts = lb.data.certificateIds || [];
      logger.info("Retrieved current load balancer config.", lb.data);
    } catch(e) {
      logger.error(e);
      throw new Meteor.Error(e);
    }

    // add the new cert to the current certs
    lbCerts.push(cert.data.id);

    const updatedCerts = {
      certificateIds: lbCerts
    };

    // add the new cert to the load balancer
    try {
      rancher.update("loadbalancerservices", balancerId, updatedCerts);
      logger.info(`Added certificate ${cert.data.id} to loadbalancer ${balancerId}`);
    } catch(e) {
      const err = "Error adding certificate.";
      logger.error(err, e);
      throw new Meteor.Error(err);
    }

    const appService = Services.findOne({ name: `app-${stackId}` });

    if (!appService) {
      const err = "App service not found.";
      logger.error(err);
      throw new Meteor.Error(err);
    }

    const appDomains = [ stack.defaultDomain, options.name ];

    // link the load balancer to the app service
    try {
      logger.info("Updating app service link on load balancer");
      // remove existing link(s)
      rancher.removeLoadBalancerLink(balancerId, appService.rancherId);
      // add new links
      rancher.addLoadBalancerLink(balancerId, appService.rancherId, appDomains);
    } catch(e) {
      logger.error(`Error updating link on load balancer for stack ${stackId}`);
      throw new Meteor.Error(e);
    }

    // update local stack
    Stacks.update({ _id: stackId }, {
      $set: {
        sslDomainName: options.name,
        sslPrivateKey: options.key,
        sslPublicCert: options.cert,
        sslCertChain: options.certChain || "",
        sslRancherCertId: cert.data.id,
        sslCertDescription: options.description || ""
      }
    });

    return cert;
  },


  'rancher/deleteStackSSLCert'(stackId, relink) {

    const logger = Logger.child({
      meteor_method: 'rancher/deleteStackSSLCert',
      meteor_method_args: stackId,
      userId: this.userId
    });

    check(stackId, String);
    check(relink, Match.Optional(Boolean));

    const stack = Stacks.findOne(stackId);

    if (!stack) {
      const err = "Stack not found";
      logger.error(err);
      throw new Meteor.Error(err);
    }

    if (!stack.sslRancherCertId) {
      const msg = "Stack does not have a custom certificate. Skipping deletion.";
      logger.info(msg, stack);
      return msg;
    }

    if (!Users.is.owner(this.userId, stack) && !Users.is.admin(this.userId)) {
      const err = "AUTH ERROR: Access denied";
      logger.error(err);
      throw new Meteor.Error(err);
    }

    const rancher = new Rancher();
    rancher.checkCredentials();

    const balancerId = Settings.get("rancherDefaultBalancer");

    // get the load balancer for this stack
    let lb;
    try {
      lb = rancher.get("loadbalancerservices", balancerId);
    } catch(e) {
      const err = "Error getting load balancer details from Rancher.";
      logger.error(err, e);
      throw new Meteor.Error(err);
    }

    // cert to be deleted
    const certId = stack.sslRancherCertId;

    // certs currently on load balancer
    let lbCerts = lb.data.certificateIds || [];

    // check if certificate is in use on the load balancer
    if (lbCerts.find(certId => certId === certId)) {
      // remove certificate from the array
      lbCertsUpdated = _.without(lbCerts, certId);

      // update load balancer with remaining certs
      const lbUpdateOptions = { certificateIds: lbCertsUpdated };
      try {
        rancher.update("loadbalancerservices", balancerId, lbUpdateOptions);
        logger.info(`Certificate ${certId} removed from load balancer ${balancerId}.`);
      } catch(e) {
        const err = "Error updating load balancer certificates.";
        logger.error(err, e);
        throw new Meteor.Error(err);
      }

      // get the app service
      const app = Services.findOne({ name: `app-${stackId}` });

      // remove the balancer => app links
      // Rancher only lets us remove ALL links, so we add the wildcard back below
      try {
        rancher.removeLoadBalancerLink(balancerId, app.rancherId);
        logger.info(`Balancer links removed for app ${app.rancherId}.`);
      } catch(e) {
        const err = "Error removing load balancer links.";
        logger.error(err, e);
        throw new Meteor.Error(err);
      }

      // add back the balancer => app link for the wildcard domain if
      // the 'relink' arg has been set to true
      if (relink) {
        try {
          rancher.addLoadBalancerLink(balancerId, app.rancherId, stack.defaultDomain);
          logger.info(`Link added to load balancer ${balancerId} for app ${app.rancherId}.`);
        } catch(e) {
          const err = "Error updating load balancer links.";
          logger.error(err, e);
          throw new Meteor.Error(err);
        }
      }
    } else {
      logger.info("Certificate not found on load balancer. No update needed.");
    }

    // delete the certificate
    try {
      rancher.delete("certificates", certId);
      logger.info(`Certificate ${certId} deleted.`);
    } catch(e) {
      const err = "Error deleting certificate.";
      logger.error(err, e);
      throw new Meteor.Error(err);
    }

    // remove certificate details from the local stack
    Stacks.update({ _id: stackId }, {
      $unset: {
        sslDomainName: "",
        sslPrivateKey: "",
        sslPublicCert: "",
        sslCertChain: "",
        sslPem: "",
        sslCertDescription: "",
        sslRancherCertId: ""
      }
    });

    logger.info(`Certificate ${certId} successfully removed from stack ${stackId}`);

    return true;
  }

});
