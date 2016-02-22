
Template.dashboard_layout.events({
  "click #sidenav-toggle"(e) {
    e.preventDefault();
    $("#dash-wrapper").toggleClass("toggled");
  }
});
