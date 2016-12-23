import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { HTTP } from 'meteor/http';
import { Roles } from 'meteor/alanning:roles';
import { Settings } from '/lib/collections';
import { Launchdock, Logger } from '/server/api';

export default function () {

  Meteor.methods({

    'intercom/getUsers'(options) {

      const logger = Logger.child({
        meteor_method: 'intercom/getUsers',
        meteor_method_args: options,
        userId: this.userId
      });

      if (!Roles.userIsInRole(this.userId, 'admin')) {
        const err = 'AUTH ERROR: Must be admin.';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      const opts = options || {};

      check(opts, {
        limit: Match.Optional(Number), // amount of results
        page: Match.Optional(Number),  // optional page number
        order: Match.Optional(String),  // 'asc' or 'desc'
        sort: Match.Optional(String)  // 'created_at', 'updated_at', or 'signed_up_at'
      });

      const { appId, apiKey } = Settings.get('intercom', {});

      if (!appId || !apiKey) {
        const err = 'Missing Intercom credentials.';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      // user/pw for HTTP Basic Auth header
      const authHeader = new Buffer(`${appId}:${apiKey}`).toString('base64');

      const params = {
        per_page: opts.limit || 50,
        page: opts.page || 1,
        order: opts.order || 'asc',
        sort: opts.sort || 'created_at'
      };

      let result;
      try {
        result = HTTP.call('GET', 'https://api.intercom.io/users', {
          headers: {
            Authorization: `Basic ${authHeader}`,
            Accept: 'application/json'
          },
          params: params
        });
      } catch(e) {
        Logger.error(e);
        throw new Meteor.Error(e);
      }

      // an array of user objects
      return result.data.users;
    },


    'intercom/updateUser'(options) {

      const logger = Logger.child({
        meteor_method: 'intercom/updateUser',
        meteor_method_args: options,
        userId: this.userId
      });

      if (!Roles.userIsInRole(this.userId, ['admin', 'customer'])) {
        const err = 'AUTH ERROR: Must be customer or admin.';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      const opts = options || {};

      check(opts, {
        id: Match.Optional(String),
        user_id: Match.Optional(String),
        email: Match.Optional(String),
        updates: Object
      });

      // either the user id or email must be provided
      if (!opts.id && !opts.email) {
        const err = 'Need to provide a user ID or email.';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      const { appId, apiKey } = Settings.get('intercom', {});

      if (!appId || !apiKey) {
        const err = 'Missing Intercom credentials.';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      // user/pw for HTTP Basic Auth header
      const authHeader = new Buffer(`${appId}:${apiKey}`).toString('base64');

      let data = {};

      // set the user_id or email
      if (opts.id) {
        data.user_id = opts.user_id;
      } else if (opts.email) {
        data.email = opts.email;
      }

      // add the user object updates
      data.custom_attributes = opts.updates;

      let result;
      try {
        result = HTTP.call('POST', 'https://api.intercom.io/users', {
          headers: {
            'Authorization': `Basic ${authHeader}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          data: data
        });
      } catch(e) {
        logger.error(e);
        throw new Meteor.Error(e);
      }

      return result;
    }

  });
}
