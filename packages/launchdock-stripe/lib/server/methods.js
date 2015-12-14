
Meteor.methods({

  /**
   * Create a new Stripe customer and subscribe them to a plan
   * @param  {Object} options = {
   *                  cardToken: {String} (token returned from Stripe.js on client)
   *                  plan: {String} (must already exist in Stripe)
   *                  userId: {String} (optional, default is this.userId)
   *                }
   * @return {Object} new customer
   */
  'stripe/createCustomerAndSubscribe'(options) {

    const logger = Logger.child({
      meteor_method: "stripe/createCustomerAndSubscribe",
      meteor_method_args: options,
      userId: this.userId
    });

    if (!this.userId) {
      const err = "AUTH ERROR: Must be logged in.";
      logger.error(err);
      throw new Meteor.Error(err);
    }

    check(options, {
      cardToken: String,
      plan: String,
      stackId: String,
      userId: Match.Optional(String)
    });

    let user;

    if (options.userId) {

      if (!Users.is.admin(this.userId)) {
        throw new Meteor.Error("Only admins can create accounts for other users.");
      }

      user = Users.findOne(options.userId);

      if (!user) {
        throw new Meteor.Error("User " + options.userId + " doesn't exist!");
      }

    } else {
      user = Users.findOne(this.userId);
    }

    const key = Launchdock.stripe.getKey("secret");
    const stripe = StripeSync(key);

    let customer;
    try {
      customer = stripe.customers.create({
        source: options.cardToken,
        plan: options.plan,
        email: user.emails[0].address,
        metadata: {
          "Launchdock User Id": user._id,
          "Launchdock Stack Id": options.stackId
        }
      });
    } catch(e) {
      const err = "Error creating new Stripe customer.";
      logger.error(err, e);
      throw new Meteor.Error(err);
    }

    logger.info("Successfully created and subscribed new customer.", customer);

    Users.update({ _id: user._id }, {
      $set: {
        "stripe.customerId": customer.id,
        "stripe.plan": options.plan,
        "stripe.created": customer.created,
        "stripe.status": "subscribed"
      }
    }, (err, num) => {
      if (err) {
        logger.error(err);
      } else {
        logger.debug("User updated with Stripe customer details.");
      }
    });

    return customer;
  }

});
