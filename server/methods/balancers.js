import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Stacks, Services, Settings } from '/lib/collections';
import { Logger, Rancher } from '/server/api';

export default function () {

  Meteor.methods({
    'rancher/createLoadBalancer'(lbName) {

      const logger = Logger.child({
        meteor_method: 'rancher/createLoadBalancer',
        meteor_method_args: lbName,
        userId: this.userId
      });

      if (!Roles.userIsInRole(this.userId, 'admin')) {
        const err = 'AUTH ERROR: Access denied';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      check(lbName, Match.Optional(String));

      const s = Settings.findOne();

      if (!!s.rancherDefaultBalancer) {
        const err = 'A load balancer service is already running.';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      const certId = Meteor.call('rancher/createDefaultCert');

      Logger.info(`Using default cert ${certId} on new load balancer`);

      const rancher = new Rancher();

      // create a stack for the load balancer
      const lbStackName = `load-balancers-${Random.id(5)}`;
      let lbStack;
      try {
        lbStack = rancher.create('stacks', { name: lbStackName });
        logger.info({ data: lbStack.data }, 'Created balancer stack on Rancher');
      } catch(e) {
        logger.error(e);
        throw new Meteor.Error(e);
      }

      const stackId = Stacks.insert({
        name: lbStackName,
        rancherId: lbStack.data.id,
        state: lbStack.data.state
      });

      const name = lbName || `lb-${Random.id(5)}`;

      // load balancer configuration
      const lbConfig = {
        name,
        environmentId: lbStack.data.id,
        launchConfig: {
          labels: {
            'io.rancher.scheduler.affinity:host_label': 'host_type=lb',
            'io.rancher.loadbalancer.ssl.ports': '443'
          },
          ports: [
            '80:80',
            '443:80'
          ]
        },
        defaultCertificateId: certId,
        startOnCreate: true
      };

      // create the load balancer
      let lb;
      try {
        lb = rancher.create('loadbalancerservices', lbConfig);
        logger.info({ data: lb.data }, 'Creating new load balancer service on Rancher');
      } catch(e) {
        logger.error(e);
        throw new Meteor.Error(e);
      }

      Services.insert({
        name,
        stackId,
        type: 'loadbalancer',
        rancherId: lb.data.id,
        state: lb.data.state
      });

      Settings.set('rancher.defaultBalancer', lb.data.id);

      return true;
    }
  });
}
