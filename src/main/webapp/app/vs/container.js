define([
  'twendai',        
  'jquery',
  'lodash',
  'vs',
  'alert'
],

function(Twendai, $, _) {
  'use strict';
  
  var ContainerLayout = Twendai.Layout.extend({
    template: 'script!container-layout',
    formFactor: 'normal',
    
    regions: {
      onecol: '#plg-ctr-one-col-content'
    },

    initialize: function() {
      var that = this;

      $('#container').html(this.el);
      this.render();            
    },
    
    setOneColView: function(view) {
      this.onecol.show(view);
    },
    
    onRender: function() {
      Twendai.Alert.bindHandlers();
    }
  });

  return _.extend(Twendai.Layouts, {
    Container: ContainerLayout
  });
  
});
