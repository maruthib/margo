define([
  'backbone',
  'jquery',
  'lodash',
  'log4js',
  'handlebars',
  'marionette'
],

function(Backbone, $, _, Log, Handlebars) {
  'use strict';

  var log = Log.getLogger('twendai');

  var Twendai = new Backbone.Marionette.Application();

  var cbMixins = {
    refreshed: function(callback) {
      this.refreshedCB.push(callback);
      return this;
    },

    fetched: function(callback) {
      this.fetchedCB.push(callback);
      return this;
    },

    done: function(callback, context) {
      context = context || this;

      if (this.resolved) {
        callback.call(context, this);
      } else {
        this.doneCB.push({
          context: context,
          callback: callback
        });
      }

      return this;
    },

    error: function(callback, context) {
      context = context || this;

      this.errorCB.push({
        context: context,
        callback: callback
      });

      return this;
    },

    resolvecomplete: function() {
      _.forEach(this.resolvedCB, function(callback) {
        callback(this);
      }, this);
      this.resolvedCB.length = 0;

      _.forEach(this.doneCB, function(cbSpec) {
        cbSpec.callback.call(cbSpec.context, this);
      }, this);
      this.doneCB.length = 0;
    },

    fetchcomplete: function(respEntity, resp, respOpts) {
      _.forEach(this.fetchedCB, function(callback) {
        callback.call(this, respEntity, resp, respOpts);
      }, this);
      this.fetchedCB.length = 0;
    },

    refreshcomplete: function(respEntity, resp, respOpts) {
      _.forEach(this.refreshedCB, function(callback) {
        callback.call(this, respEntity, resp, respOpts);
      }, this);
      this.refreshedCB.length = 0;
    },

    errorhappened: function(respEntity, xhr, respOpts) {
      _.forEach(this.errorCB, function(cbSpec) {
        cbSpec.callback.call(cbSpec.context, this, respEntity, xhr, respOpts);
      }, this);
      this.errorCB.length = 0;
    }
  };

  var modelProperties = {
    initialize: function() {
      this.fetchedCB = [];
      this.refreshedCB = [];
      this.resolvedCB = [];
      this.doneCB = [];
      this.errorCB = [];
      this.twenCollections = [];
      this.on('change', this._onChange, this);
      this.on('destroy', this._onDestroy, this);
      if (this.onInitialize) this.onInitialize.call(this);
    },

    setMVO: function(options, view) {
      var mvo = this.get('mvo');

      mvo = mvo || {};
      this.set('mvo', _.extend(mvo, options), {silent: true});

      if (!_.isUndefined(view) && (view.el.innerHTML.length !== 0)) view.render();
    },

    clearMVO: function() {
      this.unset('mvo', {silent: true});
    },

    incrAttr: function(attr) {
      var attrVal = this.get(attr);
      this.set(attr, attrVal + 1);
    },

    _onChange: function() {
      _.forEach(this.twenCollections, function(collection) {
        collection.trigger('mchange', this);
      });
    },

    _onDestroy: function() {
      var collections = _.compact(this.twenCollections);
      _.forEach(collections, function(collection) {
        collection.trigger('mdestroy', this);
      }, this);
    },

    destroyLocal: function() {
      this.trigger('destroy', this);
    }
  };

  var collectionProperties = {
    hashMap: {},

    initialize: function() {
      this.fetchedCB = [];
      this.refreshedCB = [];
      this.resolvedCB = [];
      this.doneCB = [];
      this.errorCB = [];

      this.on('add', this.onModelAdd, this);
      this.on('remove', this.onModelRemove, this);
      this.on('mdestroy', this.onModelDestroy, this);
    },

    setCVO: function(options) {
      var cvo = this.get('cvo');

      cvo = cvo || {};
      this.set('cvo', _.extend(cvo, options));
    },

    onModelAdd: function(model, collection) {
      model.twenCollections.push(collection);
    },

    onModelRemove: function(model, collection) {
      model.twenCollections.splice((_.indexOf(model.twenCollections, collection)), 1);
    },

    onModelDestroy: function(model) {
      this.remove(model);
    },

    hash: function(keyAttr) {
      this.each(function(model) {
        this.hashMap[model.get(keyAttr)] = model;
      }, this);

      return this;
    },

    mapGet: function(key) {
      return this.hashMap[key];
    },

    mapPut: function(model, keyAttr) {
      this.hashMap[model.get(keyAttr)] = model;
      return this;
    },

    mapDel: function(model, keyAttr) {
      delete this.hashMap[model.get(keyAttr)];
    }
  };

  _.extend(modelProperties, cbMixins);
  _.extend(collectionProperties, cbMixins);

  _.extend(Twendai, {
    Model: Backbone.Model.extend(modelProperties),

    Collection: Backbone.Collection.extend(collectionProperties),

    ItemView: Backbone.Marionette.ItemView.extend(),
    
    CollectionView: Backbone.Marionette.CollectionView.extend({
      appendHtml: function(collectionView, itemView, index){
        var childrenContainer = $(collectionView.childrenContainer || collectionView.el);
        var children = childrenContainer.children();
        if (children.size() === index) {
          childrenContainer.append(itemView.el);
        } else {
          childrenContainer.children().eq(index).before(itemView.el);
        }
      }
    }),

    Layout: Backbone.Marionette.Layout.extend(),
    
    // Twendai entity types
    Models: {},
    Collections: {},

    // Twendai view/layout types
    Views: {},
    Layouts: {
      Empty: Backbone.Marionette.Layout.extend({
         template: 'inline!' + '<div> </div>'
      })
    },

    // Cache of instances
    Cache: {
      Models: {},
      Collections: {},
      Layouts: {},
      Views: {},
      State: {}
    },

    Globals: {
      LocalConfig: {
        enableDemo: false,
        showScores: false
      }
    },

    Constants: {
      afterRenderDelay: 10,
      alertTimeout: 300000,
      autoSelectDelay: 10,
      USER_ALERT_TIMEOUT: 15000,
      APP_RESPONSE_TIMEOUT: 30000,
      FAST_LOAD_TIMEOUT: 1000,
      TRG_STR_LEN: 12,
      MAX_HISTORY_LEN: 1024,
      USER_ATTN_DELAY: 3000,
      USER_DELAY_MULTIPLE: 5,
      submitBehavior: {
        TAB_ONLY: 'tab-only',
        ENTER_ONLY: 'enter-only',
        TAB_OR_ENTER: 'tab-or-enter'
      },
      CONTAINER_WIDTH: 1300,
      MSEC_IN_DAY: 24 * 60 * 60 * 1000,
      MSEC_IN_HOUR: 60 * 60 * 1000,
      MSEC_IN_MIN: 60 * 1000,
      MSEC_IN_SECOND: 1000,
      SEC_IN_MIN: 60,
      SEC_IN_HOUR: 60 * 60,
      SEC_IN_DAY: 24 * 60 * 60,
      FULLNAME_SHORT_ALIAS_LENGTH: 21,
      TITLE_SHORT_ALIAS_LENGTH: 24,
      EMAILID_SHORT_ALIAS_LENGTH: 24,
      MIN_NETWORK_SIZE: 2,
      errorState: {
        NONE: 'none',
        BROKEN_LINK: 'broken-link',
        UNAUTHEN: 'unauthen'
      },
      ORDER: {
        ZERO: 0,
        FIRST: 1,
        SECOND: 2,
        THIRD: 3,
        FOURTH: 4,
        FIFTH: 5
      },
      MAX_SEARCH_CACHE_ITEMS: 6
    },

    // Utilities
    Util: {
      cfg: {
        MINS_IN_HOUR: 60,
        MINS_IN_DAY: 60 * 8
      },

      daysSince: function(options) {
        if (_.isUndefined(options.date)) {
          throw new Error('date must be specified');
        }

        return Math.floor((this.getNowMillis() - options.date) / Twendai.Constants.MSEC_IN_DAY);
      },

      daysBetween: function(options) {
        if (_.isUndefined(options.start) || _.isUndefined(options.end)) {
          throw new Error('start and end dates must be specified');
        }

        return Math.floor((options.end.getTime() - options.start.getTime()) / Twendai.Constants.MSEC_IN_DAY);
      },

      hoursSince: function(options) {
        if (_.isUndefined(options.date)) {
          throw new Error('date must be specified');
        }

        return Math.floor((this.getNowMillis() - options.date) / Twendai.Constants.MSEC_IN_HOUR);
      },

      minsSince: function(options) {
        if (_.isUndefined(options.date)) {
          throw new Error('date must be specified');
        }

        return Math.floor((this.getNowMillis() - options.date) / Twendai.Constants.MSEC_IN_MIN);
      },

      secondsSince: function(options) {
        if (_.isUndefined(options.date)) {
          throw new Error('date must be specified');
        }

        return Math.floor((this.getNowMillis() - options.date) / Twendai.Constants.MSEC_IN_SECOND);
      },

      timeSince: function(options) {
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var interval, seconds, date;

        options = options || {};

        if (_.isUndefined(options.date)) throw new Error('date must be specified');

        date = options.date;
        seconds = Math.floor((new Date() - date) / 1000);
        if (!options.negativeOk) {
          if (seconds < 0) seconds = 0;
        }
        interval = Math.floor(seconds / 86400);

        if (options.forceShort) {
          return months[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear();
        }

        if (interval > 6) {
          if (!options.shortDate) return date;

          return months[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear();
        }

        if (interval >= 1) {
          return interval + "d";
        }

        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
          return interval + "h";
        }

        interval = Math.floor(seconds / 60);
        if (interval >= 1) {
          return interval + "m";
        }

        return Math.floor(seconds) + "s";
      },

      getNowMillis: function() {
        var d = new Date();

        return d.getTime();
      },

      rangeRand: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      },

      isTabOrEnter: function(event) {
        var keyCode = event.keyCode || event.which;

        if ((keyCode === 13) || (keyCode === 9)) return true;

        return false;
      },

      isTab: function(event) {
        var keyCode = event.keyCode || event.which;

        if (keyCode === 9) return true;

        return false;
      },

      isEnter: function(event) {
        var keyCode = event.keyCode || event.which;

        if (keyCode === 13) return true;

        return false;
      },

      isDownArrow: function(event) {
        var keyCode = event.keyCode || event.which;

        if (keyCode === 40) return true;

        return false;
      },

      isUpArrow: function(event) {
        var keyCode = event.keyCode || event.which;

        if (keyCode === 38) return true;

        return false;
      },

      isSpaceBar: function(event) {
        var keyCode = event.keyCode || event.which;

        if (keyCode === 32) return true;

        return false;
      },

      isEscape: function(event) {
        var keyCode = event.keyCode || event.which;

        if (keyCode === 27) return true;

        return false;
      },

      isModifierKey: function(event) {
        return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
      },

      isUUID: function(uuid) {
        return (/^[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}$/).test(uuid);
      },

      isDeepEqual: function(objA, objB) {
        return (JSON.stringify(objA) === JSON.stringify(objB));
      },

      deepClone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
      },

      isPageHidden: function() {
        return Twendai.Globals.pageHidden;
      },

      cacheConnectStatus: function(status) {
        Twendai.Cache.State.CONNECT_STATUS = status;

        return status;
      },

      readableNumber: function readableNumber(options) {
        options = options || {};

        if (_.isUndefined(options.value)) throw new Error('value must be specified');
        if (!_.isNumber(options.value)) throw new Error('value must be a number');

        if (options.value === 0) return 0;

        var s = ['', 'K', 'M', 'G', 'T', 'P'];
        var e = Math.floor(Math.log(options.value) / Math.log(1000));
        return (options.value / Math.pow(1000, e)).toFixed(options.fixed || 1) + " " + s[e];
      },

      isNumberString: function(options) {
        var numStr;

        options = options || {};

        if (_.isUndefined(options.numStr)) throw new Error('numStr must be specified');

        if (options.retainWS !== true) numStr = options.numStr.trim();

        return (/^\d+$/.test(numStr));
      },

      strToInt: function(options) {
        options = options || {};

        if (_.isUndefined(options.numStr)) throw new Error('numStr must be specified');

        if (!this.isNumberString(options)) return Number.NaN;

        return parseInt(options.numStr, _.isUndefined(options.radix) ? 10 : options.radix);
      },

      strEndsWith: function(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
      },

      strContains: function(str, subStr) {
        return (str.indexOf(subStr) > -1);
      },

      strClipFromToEnd: function(str, subStr) {
        if (!this.strContains(str, subStr)) return str;

        return str.substring(0, str.indexOf(subStr));
      },

      arrayRemove: function(array, element) {
        var index = array.indexOf(element);

        if (index < 0) return array;

        array.splice(index, 1);

        return array;
      },

      removeWhitespace: function(options) {
        options = options || {};

        if (_.isUndefined(options.string)) throw new Error('string must be specified');

        return options.string.replace(/ /g,'');
      },

      shortAlias: function(options) {
        options = options || {};
        options.length = options.length || Twendai.Constants.TRG_STR_LEN;

        if (_.isUndefined(options.string)) throw new Error('string must be specified');
        if (options.length <= 3) throw new Error('alias length must be gt 3');

        if (options.string.length <= options.length) return options.string;

        return options.string.substring(0, options.length - 3) + '...';
      },

      insertAt: function(options) {
        options = options || {};

        if (_.isUndefined(options.string)) throw new Error('string must be specified');
        if (_.isUndefined(options.offset)) throw new Error('offset must be specified');
        if (_.isUndefined(options.value)) throw new Error('value must be specified');

        if (options.offset < 0 || options.offset >= options.string.length) {
          throw new Error('offset not within string bounds');
        }

        return (options.string.substring(0, options.offset) +
          options.value + options.string.substring(options.offset, options.string.length));
      },

      trim: function(str) {
        return str.trim().replace(/\s{2,}/g, ' ');
      },

      ViewEventRegister: {
        _eventRegSpec: function(observed, event, func, view) {
          var type, observedId;

          if (!observed.hasOwnProperty('instanceId')) {
            type = 'twendaiVent';
            observedId = type;
          } else if (observed.hasOwnProperty('cid')) {
            type = 'model';
            observedId = observed.instanceId;
          } else if (observed.hasOwnProperty('models')) {
            type = 'collection';
            observedId = observed.instanceId;
          } else {
            throw new Error('unsupported observed type');
          }

          return {
            event: event,
            func: func,
            observed: observed,
            type: type
          };
        },

        on: function(observed, event, func, view, context) {
          var viewEventRegister = Twendai.Cache.State.viewEventRegister;
          var viewERs = viewEventRegister[view.cid];
          var spec = this._eventRegSpec(observed, event, func, view);

          if (_.isUndefined(viewERs)) {
            viewEventRegister[view.cid] = [];

            view.on('close', function() {
              viewERs = viewEventRegister[view.cid];
              _.each(viewERs, function(er) {
                er.observed.off(er.event, er.func);
                //log.debug('close:' + ' type:' + er.type);
              });

              delete viewEventRegister[view.cid];
            });
          } else {
            _.each(viewERs, function(viewER) {
              if (_.isEqual(viewER, spec)) {
                throw new Error('duplicate view event reg');
              }
            });
          }

          viewEventRegister[view.cid].push(spec);
          //log.debug('on:' + ' type:' + spec.type);

          observed.on(event, func, context);
        }
      },

      randomId: function() {
        return (Math.random() + (new Date()).getTime());
      },

      TimerWheel: {
        timerRequests: [],

        setupTimer: function() {
          var timerRequests;

          if (!_.isUndefined(Twendai.Util.TimerWheel.timer)) {
            clearTimeout(Twendai.Util.TimerWheel.timer);
            delete Twendai.Util.TimerWheel.timer;
          }

          timerRequests = Twendai.Util.TimerWheel.timerRequests;
          if (timerRequests.length !== 0) {
            Twendai.Util.TimerWheel.timer =
              setTimeout(Twendai.Util.TimerWheel.timerWorker,
              timerRequests[0].nextRuntime - Twendai.Util.getNowMillis());
          }
        },

        timerWorker: function() {
          var now = Twendai.Util.getNowMillis();
          var timerRequests = Twendai.Util.TimerWheel.timerRequests;
          _.each(timerRequests, function(tr) {
            if (now > tr.nextRuntime) {
              tr.cb.call(tr.ctxt);
              Twendai.Util.TimerWheel.updateTimerRequest(tr);
            } else {
              return false;
            }
          });

          Twendai.Util.TimerWheel.timerRequests.sort(Twendai.Util.TimerWheel.sortTimerRequest);
          Twendai.Util.TimerWheel.setupTimer();
        },

        getNextRuntime: function(options) {
          var sim = Twendai.Constants.SEC_IN_MIN;
          var sih = Twendai.Constants.SEC_IN_HOUR;
          var sid = Twendai.Constants.SEC_IN_DAY;
          var nextRuntime, secondsSince, zeroAdjust;

          secondsSince = Twendai.Util.secondsSince(options);
          if (secondsSince < Twendai.Constants.SEC_IN_MIN) {
            nextRuntime = (Math.ceil(secondsSince / 10) * 10) - secondsSince;
            zeroAdjust = 10;
          } else if (secondsSince < Twendai.Constants.SEC_IN_HOUR) {
            nextRuntime = (Math.ceil(secondsSince / sim) * sim) - secondsSince;
            zeroAdjust = sim;
          } else if (secondsSince < Twendai.Constants.SEC_IN_DAY) {
            nextRuntime = (Math.ceil(secondsSince / sih) * sih) - secondsSince;
            zeroAdjust = sih;
          } else {
            nextRuntime = (Math.ceil(secondsSince / sid) * sid) - secondsSince;
            zeroAdjust = sid;
          }

          if (nextRuntime <= 0) nextRuntime = zeroAdjust;
          return Twendai.Util.getNowMillis() + (nextRuntime * Twendai.Constants.MSEC_IN_SECOND);
        },

        findTimerRequest: function(id) {
          var timerRequests = Twendai.Util.TimerWheel.timerRequests;
          var i, l, index;

          for (i = 0, l = timerRequests.length; i < l; i++) {
            if (timerRequests[i].id === id) {
              index = i;
              break;
            }
          }

          return index;
        },

        sortTimerRequest: function(tr1, tr2) {
          return tr1.nextRuntime - tr2.nextRuntime;
        },

        updateTimerRequest: function(tr) {
          tr.nextRuntime = Twendai.Util.TimerWheel.getNextRuntime({date: tr.startTime});
        },

        registerTimerRequest: function(cb, ctxt, startTime) {
          var timerRequest = {
            id: Twendai.Util.randomId(),
            cb: cb,
            ctxt: ctxt,
            startTime: startTime
          };
          Twendai.Util.TimerWheel.updateTimerRequest(timerRequest);

          Twendai.Util.TimerWheel.timerRequests.push(timerRequest);

          Twendai.Util.TimerWheel.timerRequests.sort(Twendai.Util.TimerWheel.sortTimerRequest);
          Twendai.Util.TimerWheel.setupTimer();

          return timerRequest.id;
        },

        unregisterTimerRequest: function(id) {
          var index = Twendai.Util.TimerWheel.findTimerRequest(id);
          if (!_.isUndefined(index)) {
            Twendai.Util.TimerWheel.timerRequests.splice(index, 1);
            Twendai.Util.TimerWheel.setupTimer();
          }
        }
      }
    },

    ViewUtil: {
      loading: 0,
      loadingDone: function() {
        if (--this.loading === 0) {
           $('#loader').removeClass('fa-spin').addClass('bhv-opaque');

           if (!_.isUndefined(this.shortTimer)) {
             clearTimeout(this.shortTimer);
             delete this.shortTimer;
           }

           if (!_.isUndefined(this.longTimer)) {
             clearTimeout(this.longTimer);
             delete this.longTimer;
           }
        }
      },

      loadSlowCheckCB: function() {
        if (this.loading !== 0) {
          log.error('loading resolution incomplete: redirecting to home');
          window.location.replace('/');
        }
      },

      loadFastCheckCB: function() {
        $('#loader').removeClass('bhv-opaque').addClass('fa-spin');
        this.longTimer = setTimeout(_.bind(this.loadSlowCheckCB, this), Twendai.Constants.APP_RESPONSE_TIMEOUT);
      },

      loadingInProgress: function() {
        if (this.loading++ === 0) {
          this.shortTimer = setTimeout(_.bind(this.loadFastCheckCB, this), Twendai.Constants.FAST_LOAD_TIMEOUT);
        }
      }
    },

    abbreviate: function() {
      var T;

      if (!_.isUndefined(Twendai.T)) return Twendai.T;

      T = {
        A: Twendai.Alert,
        U: Twendai.Util,
        G: Twendai.Globals,
        C: Twendai.Cache,
        K: Twendai.Constants,
        D: Twendai.DataService,
        V: Twendai.ViewService,
        S: Twendai.Cache.State,
        E: Twendai.Util.ViewEventRegister,
        TW: Twendai.Util.TimerWheel
      };

      Twendai.T = T;

      return T;
    }
  });

  _.extend(Twendai, {
    RegionCollectionView: _.extend(Twendai.CollectionView, {
      initialize: function(options) {
        if (options.regmgr === undefined) {
          throw new Error('regmgr not specified');
        }

        if (this.setupEvents === undefined) {
          throw new Error('setupEvents not defined');
        }

        this.regmgr = options.regmgr;

        this.showMe = function() {
          this.regmgr.show(this);
        };

        if (this.onRender !== undefined) {
          this._origOnRender = this.onRender;
        }

        this.onRender = function() {
          this.setupEvents.call(this);
          if (this._origOnRender) this._origOnRender.call(this);
        };

        if (this.onInitialize) return this.onInitialize.call(this, options);
      }
    })
  });

  window.Twendai = Twendai;

  Twendai.Constants.FUTURE_MS = (new Date('January 1, 3000')).getTime();

  Twendai.Cache.State.viewEventRegister = {};

  return Twendai;
});
