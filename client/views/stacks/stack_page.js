Template.stack_page.onCreated(function() {
  this.autorun(() => {
    const stackId = FlowRouter.getParam('_id');
    this.subscribe('stack-page', stackId);
  });
});


Template.stack_page.helpers({
  stackServices() {
    return Services.find({}, { sort: { name: 1 }});
  }
});


Template.stack_services_links.helpers({
  serviceLink() {
    const service = Template.instance().data;
    const stack = Stacks.findOne(service.stackId);
    if (service && stack) {
      if (stack.platform === "Rancher") {
        const rancherHost = Settings.get("rancherApiUrl");
        if (!rancherHost) {
          return null;
        }
        return `${rancherHost}/apps/${stack.rancherId}/services/${service.rancherId}/`;
      }
      if (stack.platform === "Tutum") {
        return `https://dashboard.tutum.co/container/service/show/${service.uuid}/`;
      }
    }
  },
  platform() {
    const stack = Stacks.findOne(FlowRouter.getParam('_id'));
    return stack.platform;
  }
});
