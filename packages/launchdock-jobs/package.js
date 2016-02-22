Package.describe({
  name: "launchdock:jobs",
  summary: "Launchdock jobs package"
});

Package.onUse(function(api) {

  api.versionsFrom(["METEOR@1.2.1"]);

  api.use([
    "ecmascript",
    "launchdock:core",
    "launchdock:lib",
    "launchdock:users",
    "vsivsi:job-collection"
  ]);

  api.addFiles([
    "common/collection.js",
    "common/routes.js"
  ], ["client", "server"]);

  api.addFiles([
    "server/main.js",
    "server/permissions.js",
    "server/publications.js"
  ], "server");

  api.addFiles([
    "client/views/jobs_list.html",
    "client/views/jobs_list.js"
  ], "client");

});
