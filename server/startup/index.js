import email from './email';
import hooks from './hooks';
import jobs from './jobs';
import security from './security';
import seed from './seed';
import socket from './socket';

export default function () {
  email();
  hooks();
  jobs();
  security();
  seed();
  socket();
}
