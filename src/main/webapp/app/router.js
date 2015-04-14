define([
  'twendai',
  'backbone',
  'log4js',
  'ds',
  'vs'
],

function(Twendai, Backbone, Log) {
  'use strict';

  var log = Log.getLogger("router");
  var T = Twendai.abbreviate();

  var Router = Backbone.Router.extend({
    history: [],
    dataSvc: Twendai.DataService,
    viewSvc: Twendai.ViewService,
    routes: {
      '': 'index',
      '*path': 'defaultRoute'
    },

    initialize: function() {
      this.on('all', function() {
      if (this.history.length >= Twendai.Constants.MAX_HISTORY_LEN) this.history = [];
        this.history.push(Backbone.history.fragment);
      }, this);
      
      this.containerLayout = this.viewSvc.getContainerLayout();
      this.containerLayout.setOneColView(this.viewSvc.getPageTagsLayout());

      this.on('pagesource:get', function(url) {
        this.containerLayout.setOneColView(this.viewSvc.getPageTagsLayout({
          url: url
        }));        
      });
      
      this.on('pagesource:getcomplete', function(url) {
        this.containerLayout.setOneColView(this.viewSvc.getPageTagsLayout({
          url: url,
          getcomplete: true
        }));        
      });
    }, 
 
    index: function() {
      log.debug("index");
    },

    defaultRoute: function() {
      Twendai.Router.navigate('', {
        trigger: true
      });
    }
  });

  return Router;
});
