import jobs from './jobs';
import settings from './settings';
import stacks from './stacks';
import users from './users';

export default function () {
  jobs();
  settings();
  stacks();
  users();
}
