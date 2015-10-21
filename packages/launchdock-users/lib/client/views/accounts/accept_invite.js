
Template.accept_invite.onCreated(function () {
  this.autorun(() => {
    let token = FlowRouter.getParam('token');
    this.subscribe('invite', token);
  });
});


Template.accept_invite.helpers({
  invitation() {
    return Invitations.findOne();
  }
});


Template.accept_invite.events({
  'submit form' (e, t) {
    e.preventDefault();

    let opts = {
      email: t.find('input[name="email"]').value,
      password: t.find('input[name="password"]').value,
      inviteToken: FlowRouter.getParam('token')
    }

    let $btn = t.$('button[type="submit"]');

    $btn.addClass('disabled');
    $btn.text('One sec...');

    BlazeLayout.render("dashboard_layout", { content: "loading" });

    Meteor.call( 'activateUserInvite', opts, (err, res) => {
      if (err) {
        Notify.error(err.error);
        BlazeLayout.render("dashboard_layout", { content: "accept_invite" });
      } else {
        Meteor.loginWithPassword(opts.email, opts.password, () => {
          FlowRouter.go('/');
          Notify.success('Success!', 'bottom-right');
        });
      }
    });
  }
});
