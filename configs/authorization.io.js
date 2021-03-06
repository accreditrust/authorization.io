/*!
 * authorization.io production configuration.
 *
 * New BSD License (3-clause)
 * Copyright (c) 2015-2016, Digital Bazaar, Inc.
 * Copyright (c) 2015-2016, Accreditrust Technologies, LLC
 * All rights reserved.
 */
var config = require('bedrock').config;
var path = require('path');

// location of configuration files
var _cfgdir = path.join(__dirname, '..');

// location of logs
var _logdir = '/var/log/authorization.io';

// core configuration
config.core.workers = 1;
config.core.worker.restart = true;

// master process while starting
config.core.starting.groupId = 'adm';
config.core.starting.userId = 'root';

// master and workers after starting
config.core.running.groupId = 'authorizationio';
config.core.running.userId = 'authorizationio';

// logging
config.loggers.logdir = _logdir;
config.loggers.app.filename = path.join(_logdir, 'authorization.io-app.log');
config.loggers.app.bedrock.enableChownDir = true;
config.loggers.access.filename = path.join(
  _logdir, 'authorization.io-access.log');
config.loggers.access.bedrock.enableChownDir = true;
config.loggers.error.filename = path.join(
  _logdir, 'authorization.io-error.log');
config.loggers.error.bedrock.enableChownDir = true;
config.loggers.email.silent = true;

// server info
config.server.port = 443;
config.server.httpPort = 80;
config.server.bindAddr = ['authorization.io'];
config.server.domain = 'authorization.io';
config.server.host = 'authorization.io';
config.server.baseUri = 'https://' + config.server.host;
config.server.key = path.join(_cfgdir, 'pki', 'authorization.io.key');
config.server.cert = path.join(_cfgdir, 'pki', 'authorization.io.crt');
config.server.ca = path.join(_cfgdir, 'pki', 'authorization.io-bundle.crt');

// session info
config.express.session.key = 'authio.sid';
config.express.session.prefix = 'authio.';

// database config
config.mongodb.name = 'authorization_io';
config.mongodb.host = 'localhost';
config.mongodb.port = 27017;
config.mongodb.username = 'authorizationio';
config.mongodb.adminPrompt = false;
config.mongodb.local.collection = 'authorization_io';

// view variables
config.views.brand.name = 'authorization.io';
config.views.vars.baseUri = config.server.baseUri;
config.views.vars.title = config.views.brand.name;
config.views.vars.siteTitle = config.views.brand.name;
config.views.vars.supportDomain = config.server.domain;
config.views.vars.style.brand.alt = config.views.brand.name;
config.views.vars.minify = true;

// FIXME: Everything below here is temporary for testing purposes

// load the demo extensions to the site
require('../demo/lib/idp');
require('../demo/lib/issuer');

// pseudo bower package for demo idp, issuer, and consumer
config.requirejs.bower.packages.push({
  path: path.join(__dirname, '..', 'demo', 'components'),
  manifest: {
    name: 'authio-demo',
    moduleType: 'amd',
    main: './main.js',
    dependencies: {
      angular: '~1.3.0'
    }
  }
});

require('./authorization.io-secrets');

// serve demo contexts and vocabs
config.express.static.push(path.join(__dirname, '..', 'static'));

// setup to load contexts locally
config.views.vars.contextMap[config.constants.SECURITY_CONTEXT_V1_URL] =
  config.server.baseUri + '/contexts/security-v1.jsonld';
config.views.vars.contextMap[config.constants.IDENTITY_CONTEXT_V1_URL] =
  config.server.baseUri + '/contexts/identity-v1.jsonld';
config.views.vars.contextMap[config.constants.CREDENTIALS_CONTEXT_V1_URL] =
  config.server.baseUri + '/contexts/credentials-v1.jsonld';

// setup to load demo vocabs
config.views.vars['bedrock-angular-credential'] =
  config.views.vars['bedrock-angular-credential'] || {};
config.views.vars['bedrock-angular-credential'].libraries =
  config.views.vars['bedrock-angular-credential'].libraries || {};
config.views.vars['bedrock-angular-credential'].libraries.default = {
  vocabs: [
    config.server.baseUri + '/vocabs/test-v1.jsonld'
  ]
};

// lower minimum wait time for proofs
config.authio.proofs.proofOfPatience.minWaitTimeInSecs = 2;
config.authio.proofs.proofOfPatience.maxWaitTimeInSecs = 3;
