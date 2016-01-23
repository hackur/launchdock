
Logger = Logger.child({ meteor_package: "launchdock:analytics" });


const initAnalytics = () => {
  const Analytics = Npm.require("analytics-node");
  const segmentKey = Settings.get("segmentKey");

  // global analytics export
  analytics = new Analytics(segmentKey, {
    flushAt: 0,
    flushAfter: 5000
  });
}


Settings.find().observe({
  // If the default settings doc has the Segment key, initialize the lib.
  // This will always fire on app startup if the key is there.
  added(doc) {
    if (doc.segmentKey) {
      initAnalytics();
      Logger.info("Segment analytics initialized.");
    } else {
      Logger.warn("No Segment key found in settings. Analytics not initialized");
    }
  },
  // if the key has changed, re-initialize
  changed(newDoc, oldDoc) {
    if (newDoc.segmentKey !== oldDoc.segmentKey) {
      initAnalytics();
      Logger.info("Segment API key changed.");
    }
  }
});
