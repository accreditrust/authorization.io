define([
  'angular',
  'forge/forge'
], function(angular,forge) {

'use strict';

var module = angular.module('app.login', ['bedrock.alert']);

module.controller('LoginController', function($scope, $http, $window, config, DataService, brAlertService) {
  var self = this;

  if(config.data.credential) {
    DataService.set('credential', config.data.credential);
    console.log('DataService.get(credential)', DataService.get('credential'));
  }
  if(config.data.idp) {
    DataService.set('idpInfo', config.data.idp);
  }
  if(config.data.callback) {
    DataService.set('callback', config.data.callback);
    console.log('DataService.get(callback)', DataService.get('callback'));
  }
  console.log('config.data', config.data);
  console.log('DataService.get(idp)', DataService.get('idpInfo'));

  self.login = function(username,password) {
    //TODO: fix hash to use delimeters or any other improvements
    var md = forge.md.sha256.create();
    md.update(username + password);
    var loginHash = md.digest().toHex();

    var privateKey = localStorage.getItem(loginHash);

    Promise.resolve($http.get('/DID',{params:{hashQuery:loginHash}}))
      .then(function(response) {
        console.log('response from GET /DID', response);

        // On a new device, need to do something

        //possible outcome
        // lead to IDP, which we can retrieve
        // Then have idp give authorization to create a key pair for them
        if(!privateKey){

        }

        // Coming from credential consumer
        else if(DataService.get('credential')) {
          Promise.resolve($http.get('/DID/Idp',{params:{did:response.data}}))
            .then(function(response) {
              console.log('/DID/Idp response.data', response.data);
              // TODO: Post to idp (start the key dance)
              $window.location.href = DataService.get('callback');
            })  
            .catch(function(err) {

            })
            .then(function() {
              $scope.$apply();
            });
        }

        // Coming from IDP site
        else if(DataService.get('idpInfo')) {
          Promise.resolve($http.post('/DID/Idp', {
            did: response.data,
            idp: DataService.get('idpInfo')
          }))
            .then(function(){
              // idp succesfully registered to did
              console.log('Idp succesfully registered to did.');
              $window.location.href = DataService.get('callback');
            })
            .catch(function(err){
              console.log('There was an error', err);
              brAlertService.add('error', 
                'Idp unable to be registered'); 
            })
            .then(function() {
              $scope.$apply();
            }); 
        }

        //Logged in, but nothing to do..?
        else {

        }


        // succesful login
        // TODO: Post data to callback? (credential consummer?)
        // console.log('callback', DataService.get('callback'));
        // DataService.redirect(DataService.get('callback'));
      })
      .catch(function(err) {
        console.log('There was an error', err);
        brAlertService.add('error', 
          'Invalid login information'); 
      })
      .then(function() {
        $scope.$apply();
      });
  };
});


});