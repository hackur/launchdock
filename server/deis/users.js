import { Job } from 'meteor/vsivsi:job-collection';
import { Hooks } from '/lib/api';
import { Jobs } from '/lib/collections';

export default function () {

  Hooks.Events.add('onCreateUser', (user) => {
    // create a new Deis user and log them in
    new Job(Jobs, 'deisCreateUser', { user }).save();

    return user;
  });

}
