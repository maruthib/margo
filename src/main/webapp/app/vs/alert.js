define([
  'twendai',        
  'backbone',
  'jquery',
  'lodash',
  'log4js',  
  'marionette'
],

function(Twendai, Backbone, $, _, Log) {
  'use strict';
  
  var alertCB = null;
  var cbThat = null;
  var alertCB2 = null;
  var cb2That = null;
  var alertTimer;
  var log = Log.getLogger('alert');
  var T = Twendai.abbreviate();
  
  var alert = {
   POLL_INTERVAL: 3000,
   
   mustQueueAlert: function(options) {
     if (options.withLock) return false;
     
     if (options.type === 'error') return false;
     
     if (T.S.Alert.locked || this.alertPresent()) {
       return true;
     }
     
     return false;
   },
   
   queueAlert: function(options) {
     if (T.S.Alert.locked && _.isUndefined(options.notImmediate)) {
       throw new Error('alert requested when under lock');
     } else {
       if (T.S.Alert.queue.length === 0) {
         T.S.Alert.pollTimer = 
           setInterval(_.bind(this.processQueuedAlerts, this), this.POLL_INTERVAL);
       }

       T.S.Alert.queue.push(options);         
     }
   },
   
   processQueuedAlerts: function() {
     var options;
     
     if (_.isUndefined(T.S.Alert.pollTimer) || T.S.Alert.locked || this.alertPresent()) {
       return;
     }

     options = T.S.Alert.queue.shift();
     this.showAlert(options);

     if (T.S.Alert.queue.length === 0) {
       clearInterval(T.S.Alert.pollTimer);
       delete T.S.Alert.pollTimer;
     }
   },
   
   showAlert : function(options) {
     var alertTimeout, that;
     
     options = options || {}; // desc, prompt, cb, cbdata, cbcontext
     
     if (!options.desc && !options.prompt) {
       throw new Error('one of desc or prompt must be specified');
     }

     if (this.mustQueueAlert(options)) {
       this.queueAlert(options);
       return;
     }
     
     if (options.alertTimeout) {
       alertTimeout = options.alertTimeout;
     } else {
       alertTimeout = T.K.alertTimeout;
     }
     
     if (!options.doNotClear) this.clearAlert();
     $('#alert').removeClass('alert-hide').addClass('alert-show');
     if (!options.noClose) {
       $('#alert-close').removeClass('alert-hide');
     } else {
       $('#alert-close').addClass('alert-hide');
     }
     if (!_.isUndefined(alertTimer)) {
       window.clearTimeout(alertTimer);
     }
     alertTimer = window.setTimeout(function() {
       $('#alert').removeClass('alert-show').addClass('alert-hide');
     }, alertTimeout);
     
     if (options.cbdata) $('.alert-wrap').data('cbdata', options.cbdata);
     if (options.cb2data) $('.alert-wrap').data('cb2data', options.cb2data);
     
     if (options.desc) {
       $('#alert-desc').html(options.desc);
       $('#alert-desc').removeClass('alert-hide').addClass('alert-show');
     }
     
     if (options.prompt) {
       $('#alert-prompt').html(options.prompt);
       $('#alert-prompt').removeClass('alert-hide').addClass('alert-show');
     } else {
       $('#alert-prompt').removeClass('alert-show').addClass('alert-hide');
     }

     if (options.prompt2) {
       $('#alert-prompt2').html(options.prompt2);
       $('#alert-prompt2').removeClass('alert-hide').addClass('alert-show');
     } else {
       $('#alert-prompt2').removeClass('alert-show').addClass('alert-hide');
     }

     $('#alert').removeClass('alert-warning').removeClass('alert-error').removeClass('alert-info');
     if (options.type) {
       if (options.type === 'error') $('#alert').addClass('alert-error');
       if (options.type === 'warning') $('#alert').addClass('alert-warning');       
       if (options.type === 'info') $('#alert').addClass('alert-info');       
     } else {
       $('#alert').addClass('alert-warning');              
     }
  
     that = this;
     if (options.closeOnClick) {
       $('html').on('click.anywhere', function() {
         that._hideAlert();
         $('html').off('click.anywhere');
       });
     }
     
     alertCB = options.cb;
     cbThat = options.cbcontext;

     alertCB2 = options.cb2;
     cb2That = options.cb2context;
   },
   
   alertPresent: function() {
     return $('#alert').hasClass('alert-show');
   },
   
   clearAlert: function() {
     $('#alert-desc').empty();
     $('#alert-prompt').empty();
     $('#alert-prompt2').empty();
     alert._hideAlert();
   },
   
   acquireLock: function() {
     if (T.S.Alert.locked) return false;
     
     T.S.Alert.locked = true;
     return true;
   },

   releaseLock: function() {
     T.S.Alert.locked = false;
   },
   
   _hideAlert : function() {
     $('#alert').removeClass('alert-show').addClass('alert-hide');
     $('#alert-desc').removeClass('alert-show').addClass('alert-hide');     
     $('#alert-prompt').removeClass('alert-show').addClass('alert-hide');
     $('#alert-prompt2').removeClass('alert-show').addClass('alert-hide');
     $('#alert-close').removeClass('alert-show').addClass('alert-hide');
   },
   
   _alert : function(e) {
     var cbdata;
     
     $('#alert').removeClass('alert-show').addClass('alert-hide');
     cbdata = $('.alert-wrap').data('cbdata');
     if (!_.isUndefined(alertCB)) alertCB.call(cbThat, cbdata);
   },
   
   _alert2 : function(e) {
     var cb2data;
     
     $('#alert').removeClass('alert-show').addClass('alert-hide');
     cb2data = $('.alert-wrap').data('cb2data');
     if (!_.isUndefined(alertCB2)) alertCB2.call(cb2That, cb2data);
   },
   
   showDiscovery: function() {
     var userModel, that;
     var usrDSvc = Twendai.DataService.User;
   
     that = this;           
      _.delay(function() {
        if (usrDSvc.showDiscovery() && !that.alertPresent()) {
          userModel = usrDSvc.getUserSelf();
          that.showAlert({
            desc : userModel.get('discoveryMessage'),
            cbdata: {userModel: userModel},
            prompt: userModel.get('discoveryPrompt'),
            type: 'info',
            cb: function(cbOpts) {
              usrDSvc.setDiscoverySeen(cbOpts);
            } 
          });
        }
      }, T.K.USER_ATTN_DELAY);
   },
   
   bindHandlers: function() {
     $('#alert-prompt').click(alert._alert);
     $('#alert-prompt2').click(alert._alert2);
     $('#alert-close').click(alert._hideAlert);
   }
  };
  
  T.S.Alert = {
    queue: []
  };
  
  Twendai.abbreviate();
  Twendai.T.A = alert;
  
  return _.extend(Twendai, {
    Alert: alert
  });
});
