import { Stacks } from '/lib/collections';
import { Notify } from '/client/modules/core/configs/notifications';


Template.stack_ssl.onCreated(function () {
  this.autorun(() => {
    const stackId = FlowRouter.getParam('id');
    this.subscribe('stack-page', stackId);
  });
});


Template.stack_ssl.helpers({
  stack() {
    return Stacks.findOne();
  }
});


Template.stack_ssl.events({
  'submit form'(e, t) {
    e.preventDefault();

    const stackId = FlowRouter.getParam('id');

    const options = {
      name: t.find("input[name='name']").value,
      description: t.find("textarea[name='description']").value,
      key: t.find("textarea[name='key']").value,
      cert: t.find("textarea[name='cert']").value,
      certChain: t.find("textarea[name='certChain']").value
    };

    Meteor.call('rancher/updateStackSSLCert', stackId, options, (err, res) => {
      err ? Notify.error('ERROR: Invalid SSL certificate settings') :
            Notify.success('Successfully updated SSL certificate');
    });
  }
});
