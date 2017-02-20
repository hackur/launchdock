import 'babel-polyfill';
import { App } from '/client/api';
import initContext from './configs/context';

// import modules
import appsModule from './modules/apps';
import coreModule from './modules/core';
import jobsModule from './modules/jobs';
import settingsModule from './modules/settings';
import stacksModule from './modules/stacks';
import usersModule from './modules/users';

// init context
const context = initContext();

// create app
const app = new App(context);
app.loadModule(appsModule);
app.loadModule(coreModule);
app.loadModule(jobsModule);
app.loadModule(settingsModule);
app.loadModule(stacksModule);
app.loadModule(usersModule);
app.init();
