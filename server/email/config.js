import { Settings } from '/lib/collections';

export default function () {
  /**
   * Custom email configs
   */

  // global
  const fromEmail = Settings.get('adminEmail', 'launchdock@localhost');
  Accounts.emailTemplates.siteName = 'Launchdock';
  Accounts.emailTemplates.from = `Launchdock <${fromEmail}>`;


  // enroll account
  Accounts.emailTemplates.enrollAccount.subject = () => {
    return 'You\'ve been invited to Launchdock!';
  };

  Accounts.emailTemplates.enrollAccount.html = (user, url) => {
    SSR.compileTemplate('admin-enroll', Assets.getText('server/templates/enrollment.html'));
    let html = SSR.render('admin-enroll', { url: url });
    return html;
  };


  // verifyEmail
  Accounts.emailTemplates.verifyEmail.subject = () => {
    return 'Welcome to Launchdock! Just one more step...';
  };

  // Accounts.emailTemplates.verifyEmail.html = (user, url) => {
  //   SSR.compileTemplate('verify-email', Assets.getText('server/templates/verify_email.html'));
  //   let html = SSR.render('verify-email', { url: url });
  //   return html;
  // };


  // reset password
  Accounts.emailTemplates.resetPassword.subject = () => {
    return 'Reset your Launchdock password';
  };

  // Accounts.emailTemplates.resetPassword.html = (user, url) => {
  //   SSR.compileTemplate('password-reset', Assets.getText('server/templates/password_reset.html'));
  //   let html = SSR.render('password-reset', { url: url });
  //   return html;
  // };
}
