
Meteor.methods({

  'util/slackMessage': function(message) {
    check(message, String);

    if (process.env.SLACK_ENABLED) {
      if (message) {
        return HTTP.call("POST", 'https://ongoworks.slack.com/services/hooks/incoming-webhook?token=OMeyxSMRKjeqDHaXNbNcMZgP', {
          headers: {
            "Content-Type": "application/json"
          },
          data: {
            username: 'Launchdock2',
            text: message
          }
        });
      }
    }
  }

});
