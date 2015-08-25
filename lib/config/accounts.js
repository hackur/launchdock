//////////////////////////////
// AccountsTemplates Config //
//////////////////////////////

AccountsTemplates.configure({
  forbidClientAccountCreation: true,
  lowercaseUsername: false,
  focusFirstInput: false,

  // Flow Router configs
  defaultLayout: 'login_layout',
  defaultLayoutRegions: {},
  defaultContentRegion: 'content'
});


// remove default fields
AccountsTemplates.removeField('email');
AccountsTemplates.removeField('password');

// replace with custom fields
AccountsTemplates.addFields([
  {
    _id: "username",
    type: "text",
    displayName: "Username",
    required: true,
    minLength: 3,
    trim: true,
    lowercase: true,
    errStr: 'Invalid username'
  },
  {
    _id: 'email',
    type: 'email',
    required: true,
    displayName: "Email",
    re: /.+@(.+){2,}\.(.+){2,}/,
    trim: true,
    lowercase: true,
    errStr: 'Invalid email'
  },
  {
    _id: 'password',
    type: 'password',
    required: true,
    minLength: 8,
    errStr: 'Invalid password'
  }
]);


// Define routes
AccountsTemplates.configureRoute('signIn', {
  name: 'login',
  path: '/login',
  template: 'login',
  redirect: '/'
});


// registration and password recovery not currently allowed

// AccountsTemplates.configureRoute('signUp', {
//   name: 'register',
//   path: '/register',
//   template: 'login',
//   redirect: '/'
// });

// AccountsTemplates.configureRoute('verifyEmail');
// AccountsTemplates.configureRoute('changePwd');
// AccountsTemplates.configureRoute('forgotPwd');
// AccountsTemplates.configureRoute('resetPwd');
