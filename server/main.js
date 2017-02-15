import 'babel-polyfill';
import publications from './publications';
import methods from './methods';
import deis from './deis';
import startup from './startup';

publications();
methods();
deis();
Meteor.startup(startup);


// Reaction Commerce module
import Reaction from './reaction';

Reaction();
