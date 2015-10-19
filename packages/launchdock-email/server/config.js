/**
 * Custom email configs
 */

// global
Accounts.emailTemplates.siteName = "Launchdock";
Accounts.emailTemplates.from = "Launchdock <admin@launchdock.io>";


// enroll account
Accounts.emailTemplates.enrollAccount.subject = (user) => {
  return "You've been invited to Launchdock!";
};

Accounts.emailTemplates.enrollAccount.html = (user, url) => {
  SSR.compileTemplate("admin-enroll", Assets.getText("server/templates/enrollment.html"));
  let html = SSR.render("admin-enroll", { url: url });
  return html;
};


// verifyEmail
Accounts.emailTemplates.verifyEmail.subject = (user) => {
  return "Welcome to Launchdock! Just one more step...";
};

// Accounts.emailTemplates.verifyEmail.html = (user, url) => {
//   SSR.compileTemplate("verify-email", Assets.getText("server/templates/verify_email.html"));
//   let html = SSR.render("verify-email", { url: url });
//   return html;
// };


// reset password
Accounts.emailTemplates.resetPassword.subject = (user) => {
  return "Reset your Launchdock password";
};

// Accounts.emailTemplates.resetPassword.html = (user, url) => {
//   SSR.compileTemplate("password-reset", Assets.getText("server/templates/password_reset.html"));
//   let html = SSR.render("password-reset", { url: url });
//   return html;
// };
