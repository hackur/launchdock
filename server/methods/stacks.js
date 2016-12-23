import _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import { Stacks, Services, Settings, Users } from '/lib/collections';
import { Email, Launchdock, Logger, Rancher, initAnalytics } from '/server/api';

const analytics = initAnalytics();

export default function () {

  Meteor.methods({
    'stacks/create'(doc, userId) {

      const logger = Logger.child({
        meteor_method: 'stacks/create',
        meteor_method_args: doc,
        userId: userId || this.userId
      });

      // confirms this is being called by Drive or a Launchdock admin
      if (!Launchdock.api.authCheck(doc.token, this.userId)) {
        const err = 'AUTH ERROR: Invalid credentials';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      check(doc, {
        name: String,
        appImage: Match.Optional(String),
        domainName: Match.Optional(String),
        platform: Match.Optional(String),
        appEnvVars: Match.Optional(Object),
        token: Match.Optional(String)
      });

      if (!this.userId) {
        check(userId, String);

        // if a userId was passed in, make sure that user exists
        if (!Users.findOne(userId)) {
          const err = `User ${userId} not found.`;
          logger.error(err);
          throw new Meteor.Error(err);
        }
      }

      this.unblock();

      const user = userId || this.userId;

      const rancher = new Rancher();

      if (Stacks.findOne({ name: doc.name, userId: user })) {
        const err = `A stack called ${doc.name} already exists.`;
        logger.error(err);
        throw new Meteor.Error(err);
      }

      const appImage = doc.appImage || Settings.get('docker.defaultApp');

      if (!appImage) {
        const err = 'No default app image specified.';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      const wildcardDomain = Settings.get('ssl.wildcardDomain');

      if (!doc.domainName && !wildcardDomain) {
        const err = 'Wildcard domain not configured on settings page.';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      // create the stack locally
      const stackId = Stacks.insert({
        name: doc.name,
        appImage: appImage,
        endpoint: Settings.get('loadBalancerEndpoint'),
        platform: 'Rancher',
        state: 'Creating',
        userId: user
      });

      logger.info(`New stack ${stackId} created`);

      // create the stack on Rancher
      let rancherStack;
      try {
        rancherStack = rancher.create('stacks', {
          name: doc.name + '-' + stackId
        });
      } catch(e) {
        Stacks.remove(stackId);
        logger.error(e);
        throw new Meteor.Error(e);
      }

      logger.info('Rancher stack created', rancherStack.data);

      const stack = Stacks.findOne(stackId);
      const siteId = stackId.toLowerCase();
      const siteUrl = doc.domainName ? doc.domainName :
                                       siteId + '.' + wildcardDomain;

      // update local database with returned stack details
      Stacks.update({ _id: stackId }, {
        $set: {
          defaultUrl: `https://${siteUrl}`,
          defaultDomain: siteUrl,
          rancherId: rancherStack.data.id,
          uuid: rancherStack.data.uuid,
          state: rancherStack.data.state
        }
      }, (err) => {
        if (err) {
          logger.error(err);
        } else {
          logger.debug(`Stack ${stackId} updated with Rancher stack details`);
        }
      });

      const virtualHosts = 'http://' + siteUrl + ', ws://' + siteUrl +
                         ', https://' + siteUrl + ', wss://' + siteUrl;

      // mongo environment variables
      const mongoRootUser = Random.id();
      const mongoRootPw = Random.id(30);
      const mongoUser = Random.id();
      const mongoPw = Random.id(30);
      const mongoDatabase = Random.id();
      const mongoRepSetId = Random.id();

      // mongo urls
      const mongoBaseUrl = `mongodb://${mongoUser}:${mongoPw}@mongo1-${stackId}:27017/`;
      const mongoUrl = mongoBaseUrl + mongoDatabase + '?replicaSet=' + mongoRepSetId;
      const mongoOplogUrl = mongoBaseUrl + 'local?authSource=' + mongoDatabase;

      const mongoImage = Settings.get('docker.mongoImage', 'launchdock/mongo-rep-set:latest');

      // mongo - primary config
      const mongo1 = {
        name: `mongo1-${stackId}`,
        type: 'mongo1',
        scale: 1,
        environmentId: rancherStack.data.id,
        launchConfig: {
          hostname: `mongo1-${stackId}`,
          imageUuid: `docker:${mongoImage}`,
          environment: {
            MONGO_ROLE: 'primary',
            MONGO_SECONDARY: `mongo2-${stackId}`,
            MONGO_ARBITER: `mongo3-${stackId}`,
            MONGO_ROOT_USER: mongoRootUser,
            MONGO_ROOT_PASSWORD: mongoRootPw,
            MONGO_APP_USER: mongoUser,
            MONGO_APP_PASSWORD: mongoPw,
            REP_SET: mongoRepSetId,
            MONGO_APP_DATABASE: mongoDatabase,
            MONGO_DB_PATH: `/data/${stackId}`
          },
          labels: {
            'io.rancher.scheduler.affinity:host_label': 'host_type=mongo1'
          },
          restartPolicy: {
            name: 'always'
          },
          startOnCreate: false
        }
      };

      // create mongo1 service
      let mongo1RancherId;
      try {
        const service = rancher.create('services', mongo1);
        Services.insert({
          name: service.data.name,
          imageName: service.data.launchConfig.imageUuid,
          rancherId: service.data.id,
          stackId: stackId,
          type: 'mongo1',
          uuid: service.data.uuid,
          userId: user
        });
        mongo1RancherId = service.data.id;
        logger.info('Service created', service.data);
      } catch(e) {
        logger.error(e);
        throw new Meteor.Error(e);
      }

      // mongo - secondary config
      const mongo2 = {
        name: `mongo2-${stackId}`,
        scale: 1,
        environmentId: rancherStack.data.id,
        launchConfig: {
          hostname: `mongo2-${stackId}`,
          imageUuid: `docker:${mongoImage}`,
          environment: {
            REP_SET: mongoRepSetId,
            MONGO_DB_PATH: `/data/${stackId}`
          },
          labels: {
            'io.rancher.scheduler.affinity:host_label': 'host_type=mongo2'
          },
          restartPolicy: {
            name: 'always'
          },
          startOnCreate: true
        }
      };

      // create mongo2 service
      let mongo2RancherId;
      try {
        const service = rancher.create('services', mongo2);
        Services.insert({
          name: service.data.name,
          imageName: service.data.launchConfig.imageUuid,
          rancherId: service.data.id,
          stackId: stackId,
          type: 'mongo2',
          uuid: service.data.uuid,
          userId: user
        });
        mongo2RancherId = service.data.id;
        logger.info('Service created', service.data);
      } catch(e) {
        logger.error(e);
        throw new Meteor.Error(e);
      }

      // mongo - arbiter config
      const mongo3 = {
        name: `mongo3-${stackId}`,
        scale: 1,
        environmentId: rancherStack.data.id,
        launchConfig: {
          hostname: `mongo3-${stackId}`,
          imageUuid: `docker:${mongoImage}`,
          environment: {
            JOURNALING: false,
            REP_SET: mongoRepSetId
          },
          labels: {
            'io.rancher.scheduler.affinity:host_label': 'host_type=mongo3'
          },
          restartPolicy: {
            name: 'always'
          },
          startOnCreate: true
        }
      };

      // create mongo3 service
      let mongo3RancherId;
      try {
        const service = rancher.create('services', mongo3);
        Services.insert({
          name: service.data.name,
          imageName: service.data.launchConfig.imageUuid,
          rancherId: service.data.id,
          stackId: stackId,
          type: 'mongo3',
          uuid: service.data.uuid,
          userId: user
        });
        mongo3RancherId = service.data.id;
        logger.info('Service created', service.data);
      } catch(e) {
        logger.error(e);
        throw new Meteor.Error(e);
      }

      // set mongo links
      try {
        rancher.setLinks(mongo1RancherId, [
          {
            name: `mongo2-${stackId}`,
            serviceId: mongo2RancherId
          },
          {
            name: `mongo3-${stackId}`,
            serviceId: mongo3RancherId
          }
        ]);
      } catch(e) {
        logger.error(e);
        throw new Meteor.Error(e);
      }

      // start the whole stack (currently 3 mongo services)
      try {
        const res = rancher.start('stacks', rancherStack.data.id);
        logger.info('Mongo stack started on Rancher.', res.data);
      } catch(e) {
        logger.error(e);
        throw new Meteor.Error(e);
      }

      // app container config
      const app = {
        name: `app-${stackId}`,
        scale: 1,
        environmentId: rancherStack.data.id,
        launchConfig: {
          hostname: `app-${stackId}`,
          imageUuid: `docker:${appImage}`,
          environment: {
            LAUNCHDOCK_STACK_ID: stackId,
            LAUNCHDOCK_STACK_CREATED: stack.createdAt,
            LAUNCHDOCK_DEFAULT_DOMAIN: siteUrl,
            LAUNCHDOCK_BALANCER_ENDPOINT: Settings.get('loadBalancerEndpoint', ''),
            MONGO_URL: mongoUrl,
            MONGO_OPLOG_URL: mongoOplogUrl,
            ROOT_URL: `https://${siteUrl}`,
            VIRTUAL_HOST: virtualHosts,
            PORT: 80,
            NODE: 'node',
            FORCE_SSL: 'yes'
          },
          labels: {
            'io.rancher.scheduler.affinity:host_label': 'host_type=app'
          },
          restartPolicy: {
            name: 'always'
          },
          startOnCreate: false
        }
      };

      // add custom environment variables to app (if any were provided)
      if (doc.appEnvVars) {
        const currentEnvVars = app.launchConfig.environment;
        app.launchConfig.environment = Object.assign({}, currentEnvVars, doc.appEnvVars);
        logger.info('Appended custom env vars to stack', app.launchConfig.environment);
      }

      // watch for mongo stack to be running, then start trying to connect to it
      // (stack state gets updated by persistent Rancher events websocket stream)
      const handle = Services.find({ rancherId: mongo1RancherId }).observeChanges({
        changed(id, fields) {
          if (fields.state && fields.state === 'Running') {

            // get the container URI for the mongo primary
            const mongo1Containers = rancher.getServiceContainers(mongo1RancherId);

            // open websocket and try to connect to mongo
            rancher.checkMongoState(mongo1Containers[0].id, (err, ready) => {
              if (ready) {
                // create app service
                let appRancherId;
                try {
                  const service = rancher.create('services', app);
                  Services.insert({
                    name: service.data.name,
                    imageName: service.data.launchConfig.imageUuid,
                    rancherId: service.data.id,
                    stackId: stackId,
                    type: 'app',
                    uuid: service.data.uuid,
                    userId: user
                  });
                  logger.info(`Added the app service to stack ${stackId}`);
                  appRancherId = service.data.id;
                } catch(e) {
                  logger.error(e);
                  throw new Meteor.Error(e);
                }

                // set container links for app service
                try {
                  rancher.setLinks(appRancherId, [
                    {
                      name: `mongo1-${stackId}`,
                      serviceId: mongo1RancherId
                    },
                    {
                      name: `mongo2-${stackId}`,
                      serviceId: mongo2RancherId
                    }
                  ]);
                } catch(e) {
                  logger.error(e);
                  throw new Meteor.Error(e);
                }

                // start the app service
                try {
                  const res = rancher.start('services', appRancherId);
                  logger.info(`Starting app service ${appRancherId}`, res.data);
                } catch(e) {
                  logger.error(`Error starting app service ${appRancherId} in stack ${stackId}`);
                  throw new Meteor.Error(e);
                }

                // TODO: balancers to be managed in Launchdock
                const balancerId = Settings.get('rancher.defaultBalancer');

                if (!balancerId) {
                  const e = 'No default load balancer configured.';
                  logger.error(e);
                  throw new Meteor.Error(e);
                }

                // link the load balancer to the app service
                try {
                  logger.info('Linking app service to load balancer');
                  rancher.addLoadBalancerLink(balancerId, appRancherId, siteUrl);
                } catch (e) {
                  logger.error(`Error adding link to load balancer for stack ${stackId}`);
                  throw new Meteor.Error(e);
                }
              }
            });

            handle.stop();
          }
        }
      });

      // notify admins via email if in production
      // TODO: create settings for admin emails
      if (Launchdock.isProduction()) {
        const currentUser = Users.findOne({ _id: user });

        let userInfo;

        // if launched in Launchdock dashboard,
        // use current user's email
        if (currentUser) {
          userInfo = currentUser.emails[0].address;
        }

        // if launched via API with default METEOR_USER set,
        // use that email instead
        // TODO: convert to Rancher env var syntax
        _.each(app.container_envvars, (envVar) => {
          if (envVar.key === 'METEOR_USER') {
            userInfo = envVar.value;
          }
        });

        // define email options
        const subject = `New stack creation for ${siteUrl} by ${userInfo}`;
        const text = `User: ${userInfo} \n Shop: https://${siteUrl}`;

        // send the email to all users with admin role
        Email.notifyUsersInRole('admin', subject, text);
      }

      return stackId;
    },


    'stacks/createTrial'(doc, userId) {

      const logger = Logger.child({
        meteor_method: 'rancher/createTrial',
        meteor_method_args: doc,
        userId: userId || this.userId
      });

      // confirms this is being called by Drive or a Launchdock admin
      if (!Launchdock.api.authCheck(doc.token, this.userId)) {
        const err = 'AUTH ERROR: Invalid credentials';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      check(doc, {
        name: String,
        appImage: Match.Optional(String),
        domainName: Match.Optional(String),
        platform: Match.Optional(String),
        appEnvVars: Match.Optional(Object),
        token: Match.Optional(String)
      });

      if (!this.userId) {
        check(userId, String);

        // if a userId was passed in, make sure that user exists
        if (!Users.findOne(userId)) {
          const err = `User ${userId} not found.`;
          logger.error(err);
          throw new Meteor.Error(err);
        }
      }

      this.unblock();

      const user = userId || this.userId;

      const rancher = new Rancher();

      if (Stacks.findOne({ name: doc.name, userId: user })) {
        const err = `A stack called ${doc.name} already exists.`;
        logger.error(err);
        throw new Meteor.Error(err);
      }

      const appImage = doc.appImage || Settings.get('docker.defaultApp');

      if (!appImage) {
        const err = 'No default app image specified.';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      const wildcardDomain = Settings.get('ssl.wildcardDomain');

      if (!doc.domainName && !wildcardDomain) {
        const err = 'Wildcard domain not configured on settings page.';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      // create the stack locally
      const stackId = Stacks.insert({
        name: doc.name,
        appImage: appImage,
        endpoint: Settings.get('loadBalancerEndpoint'),
        platform: 'Rancher',
        state: 'Creating',
        userId: user
      });

      logger.info(`New stack ${stackId} created`);

      // create the stack on Rancher
      let rancherStack;
      try {
        rancherStack = rancher.create('stacks', {
          name: doc.name + '-' + stackId
        });
      } catch(e) {
        Stacks.remove(stackId);
        logger.error(e);
        throw new Meteor.Error(e);
      }

      logger.info('Rancher stack created', rancherStack.data);

      const stack = Stacks.findOne(stackId);
      const siteId = stackId.toLowerCase();
      const siteUrl = doc.domainName ? doc.domainName :
                                       siteId + '.' + wildcardDomain;

      // update local database with returned stack details
      Stacks.update({ _id: stackId }, {
        $set: {
          defaultUrl: `https://${siteUrl}`,
          defaultDomain: siteUrl,
          rancherId: rancherStack.data.id,
          uuid: rancherStack.data.uuid,
          state: rancherStack.data.state
        }
      }, (err) => {
        if (err) {
          logger.error(err);
        } else {
          logger.debug(`Stack ${stackId} updated with Rancher stack details`);
        }
      });

      const virtualHosts = 'http://' + siteUrl + ', ws://' + siteUrl +
                         ', https://' + siteUrl + ', wss://' + siteUrl;

      // app container config
      const app = {
        name: `app-${stackId}`,
        scale: 1,
        environmentId: rancherStack.data.id,
        launchConfig: {
          hostname: `app-${stackId}`,
          imageUuid: `docker:${appImage}`,
          environment: {
            LAUNCHDOCK_STACK_ID: stackId,
            LAUNCHDOCK_STACK_CREATED: stack.createdAt,
            LAUNCHDOCK_DEFAULT_DOMAIN: siteUrl,
            LAUNCHDOCK_BALANCER_ENDPOINT: Settings.get('loadBalancerEndpoint', ''),
            ROOT_URL: `https://${siteUrl}`,
            VIRTUAL_HOST: virtualHosts
          },
          labels: {
            'io.rancher.scheduler.affinity:host_label': 'host_type=trial'
          },
          restartPolicy: {
            name: 'always'
          },
          startOnCreate: false
        }
      };

      // add custom environment variables to app (if any were provided)
      if (doc.appEnvVars) {
        const currentEnvVars = app.launchConfig.environment;
        app.launchConfig.environment = Object.assign({}, currentEnvVars, doc.appEnvVars);
        logger.info('Appended custom env vars to stack', app.launchConfig.environment);
      }

      // create app service
      let appRancherId;
      try {
        const service = rancher.create('services', app);
        Services.insert({
          name: service.data.name,
          imageName: service.data.launchConfig.imageUuid,
          rancherId: service.data.id,
          stackId: stackId,
          type: 'app',
          uuid: service.data.uuid,
          userId: user
        });
        logger.info(`Added the app service to stack ${stackId}`);
        appRancherId = service.data.id;
      } catch(e) {
        logger.error(e);
        throw new Meteor.Error(e);
      }

      // start the app service
      try {
        const res = rancher.start('services', appRancherId);
        logger.info(res.data, `Starting app service ${appRancherId}`);
      } catch(e) {
        logger.error(e, `Error starting app service ${appRancherId} in stack ${stackId}`);
        throw new Meteor.Error(e);
      }

      // TODO: balancers to be managed in Launchdock
      const balancerId = Settings.get('rancher.defaultBalancer');

      if (!balancerId) {
        const e = 'No default load balancer configured.';
        logger.error(e);
        throw new Meteor.Error(e);
      }

      // link the load balancer to the app service
      try {
        logger.info('Linking app service to load balancer');
        rancher.addLoadBalancerLink(balancerId, appRancherId, siteUrl);
      } catch (e) {
        logger.error(`Error adding link to load balancer for stack ${stackId}`);
        throw new Meteor.Error(e);
      }

      // notify admins via email if in production
      // TODO: create settings for admin emails
      if (Launchdock.isProduction()) {
        const currentUser = Users.findOne({ _id: user });

        let userInfo;

        // if launched in Launchdock dashboard,
        // use current user's email
        if (currentUser) {
          userInfo = currentUser.emails[0].address;
        }

        // if launched via API with default METEOR_USER set,
        // use that email instead
        // TODO: convert to Rancher env var syntax
        _.each(app.container_envvars, (envVar) => {
          if (envVar.key === 'METEOR_USER') {
            userInfo = envVar.value;
          }
        });

        // define email options
        const subject = `New stack creation for ${siteUrl} by ${userInfo}`;
        const text = `User: ${userInfo} \n App: https://${siteUrl}`;

        // send the email to all users with admin role
        Email.notifyUsersInRole('admin', subject, text);
      }

      return stackId;
    },


    'rancher/deleteStack'(id) {

      const logger = Logger.child({
        meteor_method: 'rancher/deleteStack',
        meteor_method_args: id,
        userId: this.userId
      });

      if (!Roles.userIsInRole(this.userId, 'admin')) {
        const err = 'AUTH ERROR: Must be admin.';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      check(id, String);

      const rancher = new Rancher();

      const stack = Stacks.findOne(id);

      // if there's a cert to delete on Rancher, do that first
      if (stack.sslRancherCertId) {
        Meteor.call('rancher/deleteStackSSLCert', stack._id);
      }

      try {
        const res = rancher.delete('stacks', stack.rancherId);

        if (res.statusCode === 200) {
          Stacks.remove({ _id: id });
          Services.remove({ stackId: id });
        }

        logger.info(`Stack ${id} deleted successfully.`);
      } catch(e) {
        logger.error(e);
        throw new Meteor.Error(e);
      }

      analytics.track({
        userId: this.userId,
        event: 'Stack Deleted',
        properties: {
          stackId: stack._id,
          stackUserId: stack.userId
        }
      });

      return true;
    }

  });

}
