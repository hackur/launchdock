//////////////////////////////////
// AccountsTemplates configuration
//////////////////////////////////

AccountsTemplates.configure({
  // Flow Router configs
  defaultLayout: 'login_layout',
  defaultLayoutRegions: {},
  defaultContentRegion: 'content'
});

AccountsTemplates.addField({
  _id: 'first_name',
  type: 'text',
  displayName: 'First Name',
  required: true,
  minLength: 2,
  trim: true
});

AccountsTemplates.addField({
  _id: 'last_name',
  type: 'text',
  displayName: 'Last Name',
  required: true,
  minLength: 2,
  trim: true
});

AccountsTemplates.removeField('email');
AccountsTemplates.addField({
  _id: 'email',
  type: 'email',
  required: true,
  re: /.+@(.+){2,}\.(.+){2,}/,
  errStr: 'error.accounts.Invalid email',
  trim: true,
  lowercase: true
});

AccountsTemplates.removeField('password');
AccountsTemplates.addField({
  _id: 'password',
  type: 'password',
  required: true,
  minLength: 8,
  errStr: 'error.minChar'
});



// AccountsTemplates.addField({
//   _id: 'username_and_email',
//   type: 'text',
//   displayName: 'Name or Email',
//   placeholder: 'name or email',
// });


//Routes
AccountsTemplates.configureRoute('signIn', {
  name: 'login',
  path: '/login',
  template: 'login',
  redirect: '/'
});

AccountsTemplates.configureRoute('signUp', {
  name: 'register',
  path: '/register',
  template: 'login',
  redirect: '/'
});

AccountsTemplates.configureRoute('forgotPwd');

AccountsTemplates.configureRoute('resetPwd');

//AccountsTemplates.configureRoute('changePwd');
//AccountsTemplates.configureRoute('enrollAccount');
//AccountsTemplates.configureRoute('verifyEmail');


// Config
AccountsTemplates.configure({

    // Behaviour
    forbidClientAccountCreation: false,
    confirmPassword: false,
    enablePasswordChange: true,
    overrideLoginErrors: true,
    sendVerificationEmail: false,

    // Appearance
    showAddRemoveServices: false,
    showForgotPasswordLink: true,
    showLabels: true,
    showPlaceholders: false,

    // Client-side Validation
    continuousValidation: false,
    negativeFeedback: true,
    negativeValidation: true,
    positiveValidation: true,
    positiveFeedback: true,
    showValidating: true,

    // Privacy Policy and Terms of Use
    // privacyUrl: 'privacy',
    // termsUrl: 'terms-of-use',

    // Redirects
    homeRoutePath: '/',
    redirectTimeout: 4000

    // Hooks
    // onLogoutHook: myLogoutFunc,
    // onSubmitHook: mySubmitFunc,

    // Texts
    // texts: {
    //   button: {
    //       signUp: "Register Now!"
    //   },
    //   socialSignUp: "Register",
    //   socialIcons: {
    //       "meteor-developer": "fa fa-rocket"
    //   },
    //   title: {
    //       forgotPwd: "Recover Your Passwod"
    //   },
    // },
});


// hack to get signOut route not considered among previous paths
if (Meteor.isClient) {
  Meteor.startup(function() {
    AccountsTemplates.knownRoutes.push('/sign-out');
  });
}


AccountsTemplates.configure({
  texts: {

    // title: {
    //   // changePwd: "Password Title",
    //   // enrollAccount: "Enroll Title",
    //   // forgotPwd: "Forgot Pwd Title",
    //   // resetPwd: "Reset Pwd Title",
    //   signIn: "",
    //   signUp: ""
    //   // verifyEmail: "Verify Email Title",
    // }
    // button: {
    //   changePwd: "Change Password",
    //   enrollAccount: "Enroll Text",
    //   forgotPwd: "Forgot Pwd Text",
    //   resetPwd: "Reset Pwd Text",
    //   signIn: "Sign In Text",
    //   signUp: "Sign Up Text",
    // },

    // info: {
    //   emailSent: "info.emailSent",
    //   emailVerified: "info.emailVerified",
    //   pwdChanged: "info.passwordChanged",
    //   pwdReset: "info.passwordReset",
    //   pwdSet: "info.passwordReset",
    //   signUpVerifyEmail: "Successful Registration! Please check your email and follow the instructions.",
    //   verificationEmailSent: "A new email has been sent to you. If the email doesn't show up in your inbox, be sure to check your spam folder.",
    // },

    // inputIcons: {
    //   isValidating: "fa fa-spinner fa-spin",
    //   hasSuccess: "fa fa-check",
    //   hasError: "fa fa-times",
    // },

    // errors: {
      // accountsCreationDisabled: "Client side accounts creation is disabled!!!",
      // cannotRemoveService: "Cannot remove the only active service!",
      // captchaVerification: "Captcha verification failed!",
      // loginForbidden: "error.accounts.Login forbidden",
      // mustBeLoggedIn: "error.accounts.Must be logged in",
      // pwdMismatch: "error.pwdsDontMatch",
      // validationErrors: "Validation Errors",
      // verifyEmailFirst: "Please verify your email first. Check the email and follow the link!",
    // }

  }
});
