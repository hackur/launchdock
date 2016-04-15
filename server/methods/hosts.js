import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Random } from 'meteor/random';
import { Hosts, Settings } from '/lib/collections';
import { Logger, Rancher } from '/server/api';


export default function() {

  Meteor.methods({
    'hosts/createCluster'(options) {

      const logger = Logger.child({
        meteor_method: 'hosts/createCluster',
        userId: this.userId
      });

      if (!Roles.userIsInRole(this.userId, 'admin')) {
        const err = 'AUTH ERROR: Invalid credentials';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      check(options, {
        instanceType: Match.Optional(String),
        lbInstanceType: Match.Optional(String),
        hostTypes: Match.Optional([String]),
        rootSize: Match.Optional(Number)
      });

      const defaultInstanceType = 't2.large'; // 'r3.2xlarge';

      const s = Settings.findOne();

      if (!s.awsKey || !s.awsSecret || !s.awsRegion) {
        throw new Meteor.Error('Missing AWS settings');
      }

      const rancher = new Rancher();

      // set some defaults if options weren't provided
      const hostTypes = options.hostTypes || ['lb', 'app', 'mongo1', 'mongo2', 'mongo3'];
      const instanceType = options.instanceType || 't2.large';
      const lbInstanceType = options.lbInstanceType || 't2.large';

      const clusterId = Random.id(7);

      hostTypes.forEach((type) => {

        const awsConf = {
          accessKey: s.awsKey,
          secretKey: s.awsSecret,
          region: s.awsRegion,
          instanceType: type === 'lb' ? lbInstanceType : instanceType,
          rootSize: 100,
          securityGroup: 'rancher-machine'
          // ami: 'ami-123456',
          // vpcId: 'vpc-123456',
          // zone: 'a'
        };

        const machineConfig = {
          name: `rancher.staging.${type}-${clusterId}`,
          amazonec2Config: awsConf,
          labels: {
            host_type: type
          }
        };

        let host;
        try {
          host = rancher.create('machines', machineConfig);
          Logger.info('Start machine via Rancher', host);
        } catch(e) {
          Logger.error(e);
          throw new Meteor.Error(e);
        }

        const { data } = host;

        Hosts.insert({
          type,
          clusterId,
          name: data.name,
          rancherId: data.id,
          rancherAccountId: data.accountId,
          state: data.state,
          amazonec2Config: _.omit(data.amazonec2Config, ['accessKey', 'secretKey']),
          provider: 'aws',
          labels: data.labels
        });

      });

      return true;
    }
  });

}
