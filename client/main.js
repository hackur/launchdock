import { createApp } from 'mantra-core';
import initContext from './configs/context';

// modules
import coreModule from './modules/core';
import jobsModule from './modules/jobs';
import settingsModule from './modules/settings';
import stacksModule from './modules/stacks';
import usersModule from './modules/users';

// init context
const context = initContext();

// create app
const app = createApp(context);
app.loadModule(coreModule);
app.loadModule(jobsModule);
app.loadModule(settingsModule);
app.loadModule(stacksModule);
app.loadModule(usersModule);
app.init();
