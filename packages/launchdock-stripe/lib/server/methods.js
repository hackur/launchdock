
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
      logger.error(e);
      throw new Meteor.Error(e);
    }

    logger.info("Successfully created and subscribed new customer.", customer);

    const subscription = customer.subscriptions.data[0];

    // remove unwanted fields from plan object
    delete subscription.plan.object;
    delete subscription.plan.livemode;
    delete subscription.plan.metadata;
    delete subscription.plan.statement_descriptor;
    delete subscription.plan.trial_period_days;

    Users.update({ _id: user._id }, {
      $set: {
        "stripe.customerId": customer.id,
        "subscription.created": new Date(customer.created * 1000),
        "subscription.plan": subscription.plan,
        "subscription.status": subscription.status,
        "subscription.next_payment": new Date(subscription.current_period_end * 1000)
      }
    }, (err, num) => {
      if (err) {
        logger.error(err);
      } else {
        logger.info("User updated with new Stripe customer details.");
      }
    });

    return customer;
  },


  /**
   * Update data for a Stripe customer
   * @param  {String} userId - user to update
   * @return {Object} stripe customer object
   */
  'stripe/updateCustomer'(userId) {

    const logger = Logger.child({
      meteor_method: "stripe/updateCustomer",
      meteor_method_args: userId,
      userId: this.userId
    });

    if (!this.userId) {
      const err = "AUTH ERROR: Must be logged in.";
      logger.error(err);
      throw new Meteor.Error(err);
    }

    check(userId, String);

    this.unblock();

    // if trying to update a user other than the current user,
    // make sure the user is an admin
    if (userId !== this.userId && !Users.is.admin(this.userId)) {
      const err = "AUTH ERROR: Insufficient permissions.";
      logger.error(err);
      throw new Meteor.Error(err);
    }

    const user = Users.findOne({ _id: userId });

    // make sure the specified user already has a Stripe customer created
    if (!user.stripe && !user.stripe.customerId) {
      const err = "No Stripe customer ID found for user.";
      logger.error(err);
      throw new Meteor.Error(err);
    }

    const key = Launchdock.stripe.getKey("secret");
    const stripe = StripeSync(key);

    // retrive customer from Stripe
    let customer;
    try {
      customer = stripe.customers.retrieve(user.stripe.customerId);
    } catch(e) {
      logger.error(e);
      throw new Meteor.Error(e);
    }

    // grab the subscription details
    const subscription = customer.subscriptions.data[0];

    // remove unwanted fields from plan object
    delete subscription.plan.object;
    delete subscription.plan.livemode;
    delete subscription.plan.metadata;
    delete subscription.plan.statement_descriptor;
    delete subscription.plan.trial_period_days;

    // update the subscription details for the Launchdock user
    Users.update({ _id: user._id }, {
      $set: {
        "subscription.plan": subscription.plan,
        "subscription.status": subscription.status,
        "subscription.next_payment": new Date(subscription.current_period_end * 1000)
      }
    });

    return customer;
  }

});
