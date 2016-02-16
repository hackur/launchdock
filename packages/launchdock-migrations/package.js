Package.describe({
  name: "launchdock:migrations",
  summary: "Launchdock migrations package"
});

Package.onUse(function(api) {

  api.versionsFrom("METEOR@1.2.1");

  api.use([
    "launchdock:lib"
  ]);

  api.addFiles([
    "server/main.js",
    "server/config.js",
    "server/methods.js",
    "server/migrations.js",
    "server/startup.js"
  ], "server");

});
