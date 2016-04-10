import settings from './settings';
import ssl from './ssl';
import stacks from './stacks';
import users from './users';
import utils from './utils';

export default function() {
  settings();
  ssl();
  stacks();
  users();
  utils();
}
