
Meteor.publish('launchdock-stripe-public-key', function () {
  if (!this.userId) {
    return;
  }

  const mode = Settings.get('stripeMode');
  let fields;

  if (mode == 'Live') {
    fields = { stripeLivePublishableKey: 1 }
  } else if (mode == 'Test') {
    fields = { stripeTestPublishableKey: 1 }
  } else {
    return [];
  }

  return Settings.find({}, { fields: fields });
});
