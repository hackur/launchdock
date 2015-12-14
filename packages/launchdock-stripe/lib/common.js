/**
 * Stripe Utils for Launchdock
 * @namespace
 */
Launchdock.stripe = {};


/**
 * Get the API key for the currently selected mode (Live|Test)
 * @return {String}
 */
Launchdock.stripe.getKey = function(type) {
  if (!type) {
    throw new Meteor.Error('Stripe key type required (secret|public)');
  }

  const mode = Settings.get('stripeMode');

  if (type === 'secret') {
    const keyType = (mode == 'Live' ? 'stripeLiveSecretKey' : 'stripeTestSecretKey');
    return Settings.get(keyType);
  } else if (type === 'public') {
    const keyType = (mode == 'Live' ? 'stripeLivePublishableKey' : 'stripeTestPublishableKey');
    return Settings.get(keyType);
  } else {
    throw new Meteor.Error('Not a valid Stripe key type');
  }
}
