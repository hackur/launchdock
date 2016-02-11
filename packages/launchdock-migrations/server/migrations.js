/**
 * Change publicUrl to defaultUrl on stacks
 */
Migrations.add({
  version: 1,
  name: "Change publicUrl to defaultUrl on stacks",

  up() {
    let i = 0;
    Stacks.find({ defaultUrl: { $exists: false }}).forEach((stack) => {
      Logger.info(`[Migrations]: Migrating stack ${stack._id}`);
      i++;
      Stacks.update(stack._id, {
        $rename: {
          "publicUrl": "defaultUrl"
        }
      });
    });
    Logger.info(`[Migrations]: Migrated 'publicUrl' to 'defaultUrl' for ${i} stacks.`);
  },

  down() {
    let i = 0;
    Stacks.find({ publicUrl: { $exists: false }}).forEach((stack) => {
      Logger.info(`[Migrations]: Migrating stack ${stack._id}`);
      i++;
      Stacks.update(stack._id, {
        $rename: {
          "defaultUrl": "publicUrl"
        }
      });
    });
    Logger.info(`[Migrations]: Migrated 'defaultUrl' to 'publicUrl' for ${i} stacks.`);
  }
});


/**
 * Change 'stack' to 'stackId' on services
 */
Migrations.add({
  version: 2,
  name: "Change 'stack' to 'stackId' on services",

  up() {
    let i = 0;
    Services.find({ stackId: { $exists: false }}).forEach((service) => {
      Logger.info(`[Migrations]: Migrating service ${service._id}`);
      i++;
      // get the stack that this service belongs to
      const stack = Stacks.findOne({ uri: service.stack });

      // rename stack to stackId
      Services.update(service._id, {
        $rename: {
          "stack": "stackId"
        }
      });

      // replace the Tutum URI with the Launchdock stack id
      Services.update(service._id, {
        $set: {
          "stackId": stack._id
        }
      });
    });
    Logger.info(`[Migrations]: Migrated 'stack' to 'stackId' for ${i} services.`);
  },

  down() {
    // reverse shouldn't ever be needed and would break things
    Logger.info("[Migrations]: No reverse migration available for version 2");
  }
});
