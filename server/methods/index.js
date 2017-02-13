import api from './api';
import email from './email';
import jobs from './jobs';
import balancers from './balancers';
import settings from './settings';
import ssl from './ssl';
import stacks from './stacks';
import users from './users';
import utils from './utils';

export default function () {
  api();
  email();
  jobs();
  balancers();
  settings();
  ssl();
  stacks();
  users();
  utils();
}
