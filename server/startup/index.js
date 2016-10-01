import email from './email';
import jobs from './jobs';
import security from './security';
import seed from './seed';
import socket from './socket';

export default function () {
  email();
  jobs();
  security();
  seed();
  socket();
}
