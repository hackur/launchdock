import { Random } from 'meteor/random';
import { Job } from 'meteor/vsivsi:job-collection';
import { Jobs, Users } from '/lib/collections';
import { Deis, Logger } from '/server/api';

export default function () {
  /**
   * Register and authenticate a new Deis user
   *
   * Example usage:
   * new Job(Jobs, 'deisCreateUser', { user }).save();
   */
  const deisCreateUser = Job.processJobs(Jobs, 'deisCreateUser', {
    pollInterval: 5 * 60 * 1000, // poll every 5 mins as a backup - see the realtime observer below
    workTimeout: 2 * 60 * 1000, // fail if it takes longer than 2mins
    payload: 20
  }, (jobs, callback) => {
    jobs.forEach((job) => {
      const { user } = job.data;

      const username = Random.id();
      const password = Random.secret();
      const email = user.emails[0].address;

      if (!username || !password || !email) {
        const msg = 'Email, username, and password required to create a Deis user.';
        Logger.error(`[Job]: ${msg}`);
        return job.fail(msg, { fatal: true });
      }

      const deis = new Deis();

      try {
        deis.register({ username, password, email });
        Logger.debug(`Registered new Deis user for userId ${user._id}`);
      } catch (e) {
        Logger.error(e, `Failed to create new Deis user for userId ${user._id}`);
        return job.fail(e.toString());
      }

      let result;
      try {
        result = deis.login({ username, password });
        Logger.debug({ result }, `Authenticated new Deis user for userId ${user._id}`);
      } catch (e) {
        Logger.error(e, `Failed to authenticate new Deis user for userId ${user._id}`);
        return job.fail(e.toString());
      }

      Users.update({ _id: user._id }, {
        $set: {
          'services.deis.username': username,
          'services.deis.password': password,
          'services.deis.token': result.data.token
        }
      });
    });

    return callback();
  });

  // Job Collection Observer
  Jobs.find({
    type: 'deisCreateUser',
    status: 'ready'
  }).observe({
    added() {
      deisCreateUser.trigger();
    }
  });
}
