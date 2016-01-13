
/**
 * Send an email to ALL admins
 * @param  {String}  subject - the email subject line
 * @param  {String}  content - value can be text or HTML
 * @param  {Boolean} isHtml  - (default: false) must be set to true to send HTML version
 */

Launchdock.email.sendToAdmins = function (subject, content, isHtml) {

  if (!process.env.MAIL_URL) {
    Logger.error("Launchdock.email.sendToAdmins: No MAIL_URL configured.");
    return;
  }

  // set from email
  const fromEmail = Settings.get("adminEmail", "admin@launchdock.io");

  // find all admins
  const admins = Users.find({ roles: { $in: ["admin"] } }).fetch();

  // send the email to each admin
  admins.forEach((admin) => {
    const toEmail = admin.emails[0].address;

    let options = {
      to: toEmail,
      from: fromEmail,
      subject: subject
    };

    if (isHtml) {
      options.html = content;
    } else {
      options.text = content;
    }

    Meteor.defer(() => {
      Email.send(options);
    });

    Logger.info(`Stack creation notification email sent to ${toEmail}`);
  });

}
