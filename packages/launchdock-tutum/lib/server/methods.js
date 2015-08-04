var tutum = new Tutum();

Meteor.methods({
  'tutum/createStack': function (doc) {

    if (! Users.is.admin(this.userId)) {
      throw new Meteor.Error(400, "Method 'tutum/createStack': Must be an admin.");
    }

    check(doc.name, String);

    tutum.checkCredentials();

    if (Stacks.findOne({ name: doc.name, userId: this.userId })) {
      throw new Meteor.Error(410, "A stack called '" + doc.name +"' already exists.");
    }

    var stackId = Stacks.insert({ name: doc.name, state: "Creating" });
    var siteId = stackId.toLowerCase();
    var siteUrl = "http://" + siteId + ".getreaction.io";

    // configure the stack
    var stackDetails = {
      "name": doc.name,
      "services": [
        // app
        {
          "name": "reaction-" + stackId,
          "image": "ongoworks/reaction:latest",
          "container_ports": [
            {
              "protocol": "tcp",
              "inner_port": 3000
            }
          ],
          "container_envvars": [
            {
              "key": "MONGO_URL",
              "value": "mongodb://myAppUser:myAppPassword@mongo1:27017,mongo2:27017/myAppDatabase"
            }, {
              "key": "ROOT_URL",
              "value": siteUrl
            }, {
              "key": "VIRTUAL_HOST",
              "value": siteId + ".getreaction.io"
            }
          ],
          "linked_to_service": [
            {
              "to_service": "mongo1-" + stackId,
              "name": "mongo1"
            }, {
              "to_service": "mongo2-" + stackId,
              "name": "mongo2"
            }
          ],
          "tags": [ "app" ],
          // "target_num_containers": 2,
          // "sequential_deployment": true,
          "autorestart": "ALWAYS"
        },

        // Mongo - primary
        {
          "name": "mongo1-" + stackId,
          "image": "tutum.co/ongoworks/mongo-rep-set:latest",
          "container_ports": [
            {
              "protocol": "tcp",
              "inner_port": 27017
            }
          ],
          "container_envvars": [
            {
              "key": "MONGO_ROLE",
              "value": "primary"
            }, {
              "key": "MONGO_SECONDARY",
              "value": "mongo2-" + stackId
            }, {
              "key": "MONGO_ARBITER",
              "value": "mongo3-" + stackId
            }
          ],
          "linked_to_service": [
            {
              "to_service": "mongo2-" + stackId,
              "name": "mongo2"
            }, {
              "to_service": "mongo3-" + stackId,
              "name": "mongo3"
            }
          ],
          "tags": [ "mongo1" ],
          "autorestart": "ALWAYS"
        },

        // Mongo - secondary
        {
          "name": "mongo2-" + stackId,
          "image": "tutum.co/ongoworks/mongo-rep-set:latest",
          "container_ports": [
            {
              "protocol": "tcp",
              "inner_port": 27017
            }
          ],
          "tags": [ "mongo2" ],
          "autorestart": "ALWAYS"
        },

        // Mongo - arbiter
        {
          "name": "mongo3-" + stackId,
          "image": "tutum.co/ongoworks/mongo-rep-set:latest",
          "container_ports": [
            {
              "protocol": "tcp",
              "inner_port": 27017
            }
          ],
          "container_envvars": [
            {
              "key": "JOURNALING",
              "value": "no"
            }
          ],
          "tags": [ "mongo3" ],
          "autorestart": "ALWAYS"
        }
      ]
    };

    // create the stack
    try {
      var stack = tutum.create('stack', stackDetails);
    } catch(e) {
      return e;
    }

    // update local database with returned stack details
    Stacks.update({ _id: stackId }, {
      $set: {
        uuid: stack.data.uuid,
        uri: stack.data.resource_uri,
        publicUrl: siteUrl,
        state: stack.data.state,
        services: stack.data.services
      }
    });

    // add each of the stack's services to the local Services collection
    _.each(stack.data.services, function (service_uri) {
      try {
        var service = tutum.get(service_uri);
      } catch(e) {
        return e;
      }
      Services.insert({
        name: service.data.name,
        uuid: service.data.uuid,
        imageName: service.data.image_name,
        stack: service.data.stack,
        state: service.data.state,
        tags: service.data.tags,
        uri: service_uri
      });
    });

    // link the load balancer to the app service of the new stack
    try {
      var appService = Services.findOne({ name: "reaction-" + stackId });
      tutum.addLinkToLoadBalancer(appService.name, appService.uri);
    } catch (e) {
      return e;
    }

    // start it up!
    try {
      tutum.start(stack.data.resource_uri);
    } catch(e) {
      return e;
    }

    return stackId;
  },


  'tutum/deleteStack': function (id) {

    if (! Users.is.admin(this.userId)) {
      throw new Meteor.Error(400, "Method 'tutum/deleteStack': Must be admin.");
    }

    check(id, String);

    tutum.checkCredentials();

    var stack = Stacks.findOne(id);

    try {
      var res = tutum.delete(stack.uri);

      if (res.statusCode == 202) {
        // TODO - set stack to "terminated" and
        // then remove it after a minute or two delay
        Stacks.remove({ _id: id });
      }

      return res;
    } catch(e) {
      return e;
    }
  }

});
