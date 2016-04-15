import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Stacks, Services, Settings } from '/lib/collections';
import { Launchdock, Logger, Rancher } from '/server/api';

export default function() {

  Meteor.methods({

    'rancher/createDefaultCert'() {

      const logger = Logger.child({
        meteor_method: 'rancher/createDefaultCert',
        userId: this.userId
      });

      if (!Roles.userIsInRole(this.userId, 'admin')) {
        const err = 'AUTH ERROR: Access denied';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      const rancher = new Rancher();

      const defaultCert = Settings.get('rancherDefaultCert');

      if (defaultCert) {
        const cert = rancher.get('certificates', defaultCert);

        if (cert.state === 'active') {
          const msg = `Default certificate ${cert.id} is already active`;
          logger.info({ data: cert.data }, msg);
          return defaultCert;
        }

        if (!!cert.id) {
          const err1 = `Default certificate ${cert.id} exists, but isn't active`;
          logger.error({ error: cert.data }, err1);
          throw new Meteor.Error(err1);
        }

        const err2 = 'Default certificate not found on Rancher';
        logger.error(err2);
        throw new Meteor.Error(err2);
      }

      const s = Settings.findOne();

      // configure new certificate
      const certOptions = {
        name: s.wildcardDomain + '-' + Random.id(7),
        key: s.sslPrivateKey,
        cert: s.sslCertificate
      };

      // add root cert if it exists
      if (s.sslRootCertificate) {
        certOptions.certChain = s.sslRootCertificate;
      }

      // create the new cert on Rancher
      let newCert;
      try {
        newCert = rancher.create('certificates', certOptions);
      } catch(error) {
        const msg = 'Error adding certificate.';
        logger.error({ error }, msg);
        throw new Meteor.Error(msg);
      }

      logger.info({ data: newCert.data }, 'Created new default cert on Rancher');

      // update local settings with new cert
      Settings.update({ _id: s._id }, {
        $set: {
          rancherDefaultCert: newCert.id
        }
      });

      return newCert.id;
    },


    'rancher/updateStackSSLCert'(stackId, options) {

      const logger = Logger.child({
        meteor_method: 'rancher/createCert',
        meteor_method_args: [stackId, options],
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
        const err = 'Stack not found';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      if (this.userId !== stack.userId && !Roles.userIsInRole(this.userId, 'admin')) {
        const err = 'AUTH ERROR: Access denied';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      const rancher = new Rancher();

      // TODO: check for existing cert and do an update if one exists

      // create the new cert on Rancher
      let cert;
      try {
        cert = rancher.create('certificates', options);
      } catch(e) {
        const err = 'Error adding certificate.';
        logger.error(err, e);
        throw new Meteor.Error(err);
      }

      // TODO: balancers to be managed in Launchdock
      const balancerId = Settings.get('rancherDefaultBalancer');

      if (!balancerId) {
        const err = 'No default load balancer configured.';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      // grab the current certs from the load balancer
      let lbCerts;
      try {
        const lb = rancher.get('loadbalancerservices', balancerId);
        lbCerts = lb.data.certificateIds || [];
        logger.info('Retrieved current load balancer config.', lb.data);
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
        rancher.update('loadbalancerservices', balancerId, updatedCerts);
        logger.info(`Added certificate ${cert.data.id} to loadbalancer ${balancerId}`);
      } catch(e) {
        const err = 'Error adding certificate.';
        logger.error(err, e);
        throw new Meteor.Error(err);
      }

      const appService = Services.findOne({ name: `app-${stackId}` });

      if (!appService) {
        const err = 'App service not found.';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      const appDomains = [ stack.defaultDomain, options.name ];

      // link the load balancer to the app service
      try {
        logger.info('Updating app service link on load balancer');
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
          sslCertChain: options.certChain || '',
          sslRancherCertId: cert.data.id,
          sslCertDescription: options.description || ''
        }
      });

      return cert;
    },


    'rancher/deleteStackSSLCert'(stackId, relink) {

      const logger = Logger.child({
        meteor_method: 'rancher/deleteStackSSLCert',
        meteor_method_args: [stackId, relink],
        userId: this.userId
      });

      check(stackId, String);
      check(relink, Match.Optional(Boolean));

      const stack = Stacks.findOne(stackId);

      if (!stack) {
        const err = 'Stack not found';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      if (!stack.sslRancherCertId) {
        const msg = 'Stack does not have a custom certificate. Skipping deletion.';
        logger.info(msg, stack);
        return msg;
      }

      if (this.userId !== stack.userId && !Roles.userIsInRole(this.userId, 'admin')) {
        const err = 'AUTH ERROR: Access denied';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      const rancher = new Rancher();

      const balancerId = Settings.get('rancherDefaultBalancer');

      // get the load balancer for this stack
      let lb;
      try {
        lb = rancher.get('loadbalancerservices', balancerId);
      } catch(e) {
        const err = 'Error getting load balancer details from Rancher.';
        logger.error(err, e);
        throw new Meteor.Error(err);
      }

      // cert to be deleted
      const certId = stack.sslRancherCertId;

      // certs currently on load balancer
      let lbCerts = lb.data.certificateIds || [];

      // check if certificate is in use on the load balancer
      if (lbCerts.find(certId => certId === certId)) { // eslint-disable-line
        // remove certificate from the array
        lbCertsUpdated = _.without(lbCerts, certId);

        // update load balancer with remaining certs
        const lbUpdateOptions = { certificateIds: lbCertsUpdated };
        try {
          rancher.update('loadbalancerservices', balancerId, lbUpdateOptions);
          logger.info(`Certificate ${certId} removed from load balancer ${balancerId}.`);
        } catch(e) {
          const err = 'Error updating load balancer certificates.';
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
          const err = 'Error removing load balancer links.';
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
            const err = 'Error updating load balancer links.';
            logger.error(err, e);
            throw new Meteor.Error(err);
          }
        }
      } else {
        logger.info('Certificate not found on load balancer. No update needed.');
      }

      // delete the certificate
      try {
        rancher.delete('certificates', certId);
        logger.info(`Certificate ${certId} deleted.`);
      } catch(e) {
        const err = 'Error deleting certificate.';
        logger.error(err, e);
        throw new Meteor.Error(err);
      }

      // remove certificate details from the local stack
      Stacks.update({ _id: stackId }, {
        $unset: {
          sslDomainName: '',
          sslPrivateKey: '',
          sslPublicCert: '',
          sslCertChain: '',
          sslPem: '',
          sslCertDescription: '',
          sslRancherCertId: ''
        }
      });

      logger.info(`Certificate ${certId} successfully removed from stack ${stackId}`);

      return true;
    }

  });

}
