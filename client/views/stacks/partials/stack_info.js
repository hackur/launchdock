
Template.stack_info.onCreated(function() {
  this.autorun(() => {
    const stackId = FlowRouter.getParam('_id');
    this.subscribe('stack-page', stackId);
  });
});


Template.stack_info.helpers({
  stack() {
    return Stacks.find();
  },
  stackLink() {
    const stackId = FlowRouter.getParam('_id');
    const stack = Stacks.findOne(stackId);

    if (stack.platform === "Rancher") {
      const rancherHost = Settings.get("rancherApiUrl");
      if (!rancherHost) {
        return null;
      }
      return `${rancherHost}/apps/${stack.rancherId}`;
    } else if (stack.platform === "Tutum") {
      return `https://dashboard.tutum.co/stack/show/${stack.uuid}/`;
    }
  },
  stackUrlReady() {
    // TODO: do some health checks to make sure app is actually ready to view
    const stack = Stacks.findOne();
    return (stack.services.length === 4 && stack.state === 'Running');
  },
  isStackPage() {
    return (FlowRouter.getRouteName() === "stack_page");
  },
  isRancher() {
    const stackId = FlowRouter.getParam('_id');
    const stack = Stacks.findOne(stackId);
    return (stack.platform === "Rancher");
  }
});


Template.stack_info.events({
  "click #delete-cert"(e, t) {
    const stackId = FlowRouter.getParam('_id');
    const stack = Stacks.findOne(stackId);

    Alert.confirm({
      title: "Are you sure?",
      text: "There's no going back!"
    }, () => {
      const relinkApp = true;
      Meteor.call(`rancher/deleteStackSSLCert`, stackId, relinkApp, (err) => {
        if (err) {
          Alert.error({
            title: "Oops!",
            text: `Something went wrong deleting the certificate.`
          });
        }
      });
    });
  }
});
