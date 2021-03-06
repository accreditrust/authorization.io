/*!
 * New BSD License (3-clause)
 * Copyright (c) 2015-2016, Digital Bazaar, Inc.
 * Copyright (c) 2015-2016, Accreditrust Technologies, LLC
 * All rights reserved.
 */
define(['angular'], function(angular) {

'use strict';

/* @ngInject */
function factory(aioIdentityService, aioOperationService, brAlertService) {
  return {
    restrict: 'E',
    scope: {
      filter: '=?aioIdentityChooserFilter',
      callback: '&aioIdentityChooserCallback'
    },
    controller: function() {},
    controllerAs: 'ctrl',
    bindToController: true,
    link: Link,
    templateUrl: requirejs.toUrl(
      'authio/identity-chooser/identity-chooser.html')
  };

  function Link(scope, element, attrs, ctrl) {
    ctrl.loading = true;
    ctrl.authenticating = false;
    ctrl.selected = null;

    ctrl.display = {};
    ctrl.display.identityChooser = true;

    var init = false;
    scope.$watch(function() {
      return ctrl.filter;
    }, function(filter) {
      if(filter === undefined) {
        return;
      }
      updateIdentities(filter);
      if(!init) {
        ctrl.loading = false;
        init = true;
      }
    });

    ctrl.identityAdded = function() {
      updateIdentities(ctrl.filter);
    };

    ctrl.authenticate = function(id, password) {
      ctrl.authenticating = true;
      try {
        aioIdentityService.authenticate(id, password);
      } catch(err) {
        ctrl.authenticating = false;
        brAlertService.add('error', err, {scope: scope});
        scope.$apply();
        return;
      }
      return ctrl.select(id).catch(function() {}).then(function() {
        ctrl.authenticating = false;
        scope.$apply();
      });
    };

    ctrl.select = function(id) {
      if(ctrl.selected === id && !aioIdentityService.isAuthenticated(id)) {
        // do nothing if the identity is already selected
        return Promise.resolve();
      }
      ctrl.selected = id;
      if(aioIdentityService.isAuthenticated(id)) {
        // no further user mediation required, generate session
        return aioIdentityService.createSession(id).catch(function(err) {
          ctrl.callback({err: err, session: null});
        }).then(function(session) {
          if(session) {
            ctrl.callback({err: null, session: session});
          }
        });
      }
      // clear password and show login form
      ctrl.password = '';
      ctrl.display.loginForm = true;
      return Promise.resolve();
    };

    function updateIdentities(filter) {
      if(filter === null) {
        ctrl.identities = aioIdentityService.identities.getAll();
      } else {
        var identity = aioIdentityService.identities.get(filter);
        ctrl.identities = {};
        if(identity) {
          ctrl.identities[identity.id] = identity;
        }
      }
      angular.forEach(ctrl.identities, function(identity, id) {
        aioIdentityService.getDidDocument(id).then(function(doc) {
          return aioIdentityService.getDidDocument(doc.idp);
        }).then(function(doc) {
          ctrl.identities[id].sysRepoDomain =
            aioOperationService.parseDomain(doc.url);
          // TODO: check repo URL for a label to use instead of the domain
        }).catch(function(err) {
          ctrl.identities[id].sysRepoDomain =
            'Error: Could not find repository domain.';
        }).then(function() {
          scope.$apply();
        });
      });
    }
  }
}

return {aioIdentityChooser: factory};

});
