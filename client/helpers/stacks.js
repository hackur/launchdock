
/**
 * Helper that returns a CSS class name for setting the
 * color of a state string on the page.
 * @param  {Object} item - any item with a state property (stack|service|node)
 * @return {String} returns a color name used in a CSS class
 */
Template.registerHelper('stateClass', function(item) {
  switch (item.state) {
    case 'Running':
      return 'green'
      break;
    case 'Not running':
      return 'red'
      break;
    case 'Starting':
      return 'orange'
      break;
    case 'Redeploying':
      return 'orange'
      break;
    case 'Partly running':
      return 'orange'
      break;
    case 'Stopping':
      return 'red'
      break;
    case 'Stopped':
      return 'red'
      break;
    case 'Terminated':
      return 'muted'
      break;
  }
})
