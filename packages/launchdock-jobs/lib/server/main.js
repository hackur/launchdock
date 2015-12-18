
Logger = Logger.child({ meteor_package: "launchdock:jobs" });


// define jobs collection
Launchdock.Jobs = JobCollection("jobs");


// custom error logging for jobs
Launchdock.Jobs.events.on("error", (event) => {
  Logger.error("Job queue error", event);
});


// start jobs server
Meteor.startup(() => {
  Logger.info("Starting job server");
  Launchdock.Jobs.startJobServer();
});
