import _ from 'lodash';
import { HTTP } from 'meteor/http';
import { Settings } from '/lib/collections';


const Slack = {
  /**
   * Send Slack message if webhook URL is configured
   * @param  {String} text - message for Slack bot to send
   * @return {Object} response from Slack API
   */
  message(text) {
    const slackWebhookUrl = Settings.get('slackWebhookUrl');

    if (process.env.SLACK_ENABLED && slackWebhookUrl) {
      const siteTitle = _.startCase(Settings.get('siteTitle', 'Launchdock'));
      const username = _.words(siteTitle).join('');

      return HTTP.call('POST', slackWebhookUrl, {
        headers: {
          'Content-Type': 'application/json'
        },
        data: { username, text }
      });
    }
  }
};

export default Slack;
