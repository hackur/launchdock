Package.describe({
  name: "launchdock:rancher",
  summary: "Rancher integration for Launchdock."
});

Npm.depends({
  "ws": "1.0.1"
});

Package.onUse(function (api) {

  api.versionsFrom(["METEOR@1.2.1"]);

  api.use([
    "launchdock:lib",
    "launchdock:settings"
  ]);

  api.addFiles([
    "lib/server/main.js",
    "lib/server/rancher.js",
    "lib/server/socket.js",
    // "lib/server/methods/stacks.js"
  ], ["server"]);

  api.export("Rancher", "server");
});
