
Template.stack_new.onCreated(function() {
  this.subs = this.subscribe("platform-settings");

  // set default platform choice
  this.currentPlatform = new ReactiveVar();

  this.autorun(() => {
    if (this.subs.ready()) {
      const platform = Settings.get("defaultPlatform", "Rancher");

      // set starting value of switch
      if (platform === "Tutum") {
        this.find(".switcher").checked = true;
      }

      this.currentPlatform.set(platform);
    }
  });
});


Template.stack_new.helpers({
  // create method name based on platform choice
  methodName() {
    const platform = Template.instance().currentPlatform.get();
    return platform ? `${platform.toLowerCase()}/createStack` : "";
  }
});


Template.stack_new.events({
  // toggle the platform choice
  "change .switcher"(e, t) {
    const platform = e.target.checked ? "Tutum" : "Rancher"
    t.currentPlatform.set(platform);
  }
});


Template.stack_new.onRendered(function() {

  // platform selector switch
  this.autorun((c) => {
    // don't render until settings sub is ready
    if (this.currentPlatform.get()) {
      Switchery(this.find(".switcher"), {
        color: "#009fe9",
        secondaryColor: "#2cb6e3",
      });

      c.stop();
    }
  });

  // submit button animations
  const btn = this.find('button[type=submit]');
  Ladda.bind(btn);
});


AutoForm.hooks({
  insertStackForm: {
    before: {
      method(doc) {
        // set deployment platform
        const checked = this.template.find(".switcher").checked;
        doc.platform = checked ? "Tutum" : "Rancher";
        return doc;
      }
    },
    onSuccess(formType, result) {
      FlowRouter.go('stack_page', { _id: result });
      Notify.success('Stack created successfully! ID: ' + result);
    },
    onError(formType, error) {
      Notify.error(`ERROR: ${error}`);
    }
  }
});
