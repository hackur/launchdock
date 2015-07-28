
Template.stacks_list.onCreated(function () {
  this.subscribe('stacks-count');
});


Template.stacks_list.helpers({
  hasStacks: function () {
    return !!Counts.get('stacks-count');
  },
  settings: function () {
    return {
      collection: 'stacks-list',
      rowsPerPage: 20,
      showFilter: true,
      fields: [
        { key: 'uuid', label: 'Tutum UUID', sortable: false },
        { key: 'name', label: 'Name'},
        { key: 'state', label: 'State'},
        { key: 'createdAt', label: 'Created', fn: function (val) {
          return moment(val).format('LLL') + " (" + moment(val).fromNow() +")" } },
        { key: 'actions', label: 'Actions', tmpl: Template.stacks_list_actions, sortable: false }
      ]
    };
  }
});
