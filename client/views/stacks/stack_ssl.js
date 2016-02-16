
Template.stack_ssl.onCreated(function() {
  this.autorun(() => {
    const stackId = FlowRouter.getParam('_id');
    this.subscribe('stack-page', stackId);
  });
});


Template.stack_ssl.onRendered(function() {
  // submit button animations
  const btn = this.find('button[type=submit]');
  Ladda.bind(btn);
});


Template.stack_ssl.helpers({
  stack() {
    return Stacks.findOne();
  }
});


Template.stack_ssl.events({
  "submit form"(e, t) {
    e.preventDefault();

    const stackId = FlowRouter.getParam('_id');
    const stack = Stacks.findOne(stackId);

    // build method options for each platform
    let options;
    if (stack.platform === "Rancher") {
      options = {
        name: t.find("input[name='name']").value,
        description: t.find("textarea[name='description']").value,
        key: t.find("textarea[name='key']").value,
        cert: t.find("textarea[name='cert']").value,
        certChain: t.find("textarea[name='certChain']").value
      };
    } else {
      // TODO: make method options match Rancher's
      options = {};
      options.$set = {
        sslDomainName: t.find("input[name='name']").value,
        sslPrivateKey: t.find("textarea[name='key']").value,
        sslPublicCert: t.find("textarea[name='cert']").value,
        updatedAt: new Date(),
        lastUpdatedBy: Meteor.userId()
      };
    }

    const platform = stack.platform.toLowerCase();
    const methodName = `${platform}/updateStackSSLCert`;

    Meteor.call(methodName, stackId, options, (err, res) => {
      err ? Notify.error("ERROR: Invaid SSL certificate settings") :
            Notify.success("Successfully updated SSL certificate");
    });
  }
});
