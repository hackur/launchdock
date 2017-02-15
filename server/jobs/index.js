import cleanup from './cleanup';
import deis from './deis';
import email from './email';

export default function () {
  cleanup();
  deis();
  email();
}
