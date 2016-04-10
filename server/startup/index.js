import security from './security';
import seed from './seed';
import socket from './socket';

export default function() {
  security();
  seed();
  socket();
}
