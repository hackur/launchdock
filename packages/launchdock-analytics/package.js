
Package.describe({
  name: "launchdock:analytics",
  summary: "Segment.com analytics integration for Launchdock."
});

Npm.depends({
  "analytics-node": "2.0.1"
});

Package.onUse(function (api) {

  api.versionsFrom(["METEOR@1.2.1"]);

  api.use([
    "ecmascript",
    "launchdock:lib",
    "launchdock:settings"
  ]);

  api.addFiles([
    "lib/server/main.js"
  ], ["server"]);

  api.export("analytics");
});
