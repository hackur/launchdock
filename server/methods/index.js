import api from './api';
import jobs from './jobs';
import balancers from './balancers';
import hosts from './hosts';
import settings from './settings';
import ssl from './ssl';
import stacks from './stacks';
import users from './users';
import utils from './utils';

export default function () {
  api();
  jobs();
  balancers();
  hosts();
  settings();
  ssl();
  stacks();
  users();
  utils();
}
