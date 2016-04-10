import intercom from './methods/intercom';
import users from './methods/users';
import utils from './methods/utils';
import publications from './publications';

export default function() {
  intercom();
  users();
  utils();
  publications();
}
