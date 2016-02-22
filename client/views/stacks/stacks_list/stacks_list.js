
Template.stacks_list.onCreated(function() {
  this.subscribe("stacks-count");
});


Template.stacks_list.helpers({
  hasStacks() {
    return !!Counts.get("stacks-count");
  },
  settings() {
    return {
      collection: "stacks-list",
      rowsPerPage: 15,
      showFilter: true,
      fields: [
        { key: "defaultUrl", label: "URL", tmpl: Template.stacks_list_url, sortable: false},
        { key: "name", label: "Name"},
        { key: "state", label: "State"},
        { key: "createdAt", label: "Created", sort: "descending",
          fn: (val) => { return `${moment(val).format("LLL")} (${moment(val).fromNow()})` }
        },
        { key: "actions", label: "Actions", tmpl: Template.stacks_list_actions, sortable: false }
      ]
    };
  }
});
