define([
  'twendai',
  'jquery',
  'lodash',
  'log4js',
  'container',
  'tags'
],

function(Twendai, $, _, Log) {
  'use strict';

  var log = Log.getLogger('vs.js');
  var REUSE = false;
  var CACHE = true;

  if (REUSE === true && CACHE === false ) {
    throw new Error('REUSE requires CACHE');
  }

  var vs = {
    status: {},

    getLayout: function(options, viewOptions) {
      var cachedLayouts, layout;

      options = options || {};
      if (!options.name) throw new Error('name must be specified');

      if (REUSE === false) {
        if (!options.type) throw new Error('type must be specified');
        layout = new Twendai.Layouts[options.type](viewOptions);
        layout.name = options.name;

        if (CACHE === true) {
          cachedLayouts = Twendai.Cache.Layouts;
          if (cachedLayouts[options.name]) delete cachedLayouts[options.name];
          cachedLayouts[options.name] = layout;

          layout.on('close', function() {
            delete cachedLayouts[options.name];
          }, this);
        }

        return layout;
      }

      cachedLayouts = Twendai.Cache.Layouts;
      if (!cachedLayouts[options.name]) {
        if (!options.type) throw new Error('layout get requires type');
        layout = new Twendai.Layouts[options.type](viewOptions);
        layout.name = options.name;
        cachedLayouts[options.name] = layout;

        layout.on('close', function() {
          delete cachedLayouts[options.name];
        }, this);
      }

      return cachedLayouts[options.name];
    },

    getEmptyLayout: function() {
      return this.getLayout({type: 'Empty', name: 'Empty'});
    },

    getContainerLayout: function() {
      return this.getLayout({type: 'Container', name: 'Container'});
    },
    
    getPageTagsLayout: function(options) {
      options = options || {};
      
      return this.getLayout({
        type: 'PageTags',
        name: 'PageTags'
      }, {
        url: options.url,
        getcomplete: options.getcomplete
      });
    }
  };

  Twendai.abbreviate();  
  Twendai.T.V = vs;

  return _.extend(Twendai, {
    ViewService: vs
  });

});
