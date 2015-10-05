define([], function() {

'use strict';

function factory(aioIdentityService, brAlertService) {
  return {
    restrict: 'E',
    scope: {
      filter: '=?aioIdentityChooserFilter',
      callback: '&aioIdentityChooserCallback'
    },
    controller: function() {},
    controllerAs: 'ctrl',
    bindToController: true,
    link: Link
  };

  function Link(scope, element, attrs, ctrl) {
    ctrl.loading = true;
    ctrl.selected = null;

    ctrl.display = {};
    ctrl.display.identityChooser = true;
    ctrl.display.newIdentity = false;

    var init = false;
    scope.$watch(function() {
      return ctrl.filter;
    }, function(filter) {
      if(filter === undefined) {
        return;
      }
      if(filter === null) {
        ctrl.identities = aioIdentityService.identities.getAll();
      } else {
        var identity = aioIdentityService.identities.get(filter);
        ctrl.identities = {};
        if(identity) {
          ctrl.identities[identity.id] = identity;
        }
      }
      if(!init) {
        ctrl.loading = false;
        init = true;
      }
    });

    ctrl.load = function() {
      ctrl.loading = true;
      aioIdentityService.load({
        identifier: ctrl.email,
        password: ctrl.password,
        temporary: ctrl.remember
      }).then(function(identity) {
        aioIdentityService.authenticate(identity.id, ctrl.password);
        return identity;
      }).then(function(identity) {
        return ctrl.select(identity.id);
      }).catch(function(err) {
        brAlertService.add('error', err, {scope: scope});
      }).then(function() {
        ctrl.loading = false;
        scope.$apply();
      });
    };

    ctrl.authenticate = function(id, password) {
      try {
        aioIdentityService.authenticate(id, password);
      } catch(err) {
        brAlertService.add('error', err, {scope: scope});
        return;
      }
      return ctrl.select(id);
    };

    ctrl.select = function(id) {
      ctrl.selected = id;
      if(aioIdentityService.isAuthenticated(id)) {
        // no further user mediation required, generate session
        return aioIdentityService.createSession(id).then(function(session) {
          ctrl.callback({err: null, session: session});
        });
      }
      ctrl.display.loginForm = true;
    };
  }
}

return {aioIdentityChooser: factory};

});