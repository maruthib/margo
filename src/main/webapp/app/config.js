require.config({
  paths: {
    // Libraries.
    handlebars: '../js/handlebars',
    bootstrap: '../js/bootstrap.min',
    jquery: '../js/jquery.min',
    lodash: '../js/lodash.min',
    backbone: '../js/backbone-min',
    marionette: '../js/backbone.marionette.min',
    log4javascript: '../js/log4javascript',
    log4js: '../js/log4jswrapper',

    // App
    router: 'router',
    twendai: 'vs/twendai',    
    vs: 'vs/vs',
    container: 'vs/container',
    tags: 'vs/tags',
    alert: 'vs/alert',    
    twen: 'vs/twen',
    ds: 'ds/ds',
    entity: 'ds/entity'    
  },

  shim: {
    backbone: {
      deps: ['lodash', 'jquery'],
      exports: 'Backbone'
    },
    marionette: {
      deps: ['backbone', 'lodash', 'jquery'],
      exports: 'Marionette'
    },
    handlebars: {
      exports: 'Handlebars'
    },
    log4javascript: {
      exports: 'log4javascript'
    },
    bootstrap: {
      deps: ['jquery']
    },
    'plugins/backbone.layoutmanager': ['backbone']
  }

});

require(['app', 'main']);
