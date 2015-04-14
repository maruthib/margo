define([
  'twendai',
  'lodash',
  'log4js',
  'entity'
],

function(Twendai, _, Log) {
  'use strict';

  var log = Log.getLogger('ds');
  var T = Twendai.abbreviate();

  _.extend(Twendai, {
    DataService: {}
  });

  _.extend(Twendai.DataService, {
    createModel: function(options) {
      var model;

      options = options || {};
      if (!options.type) throw new Error('type must be specified');

      if (options.id && !options.local) {
        throw new Error('id can be set during creation for local models only');
      }

      model = new options.type(options.attrs);
      model.instanceId = T.U.randomId();
      model.on('destroy', function(delModel) {
        delete Twendai.Cache.Models[delModel.id];
      });

      // local models are resolved by definition
      if (options.local === true) {
        model.resolved = true;
        if (options.id) model.id = options.id;
      } else {
        if (_.isUndefined(model.resolved)) {
          model.resolved = false;
        }
      }

      if (model.id) Twendai.Cache.Models[model.id] = model;

      return model;
    },

    delModel: function(options) {
      var model, modelId;

      options = options || {};
      if (!options.model) throw new Error('model must be specified');

      delete Twendai.Cache.Models[options.model.id];
      model = options.model;

      // Model could still be around, atleast until GC
      model.resolved = false;

      modelId = model.id;
      model.destroy({
        success: function(respModel, resp, respOpts) {
          log.debug('model deleted: modelId' + modelId);
          if (options.success) options.success.call(options.context || this, respModel, resp, respOpts);
        },
        error: function(respModel, xhr, respOpts) {
          log.error('deleting model failed: xhr:' + xhr);
          if (options.error) options.error.call(options.context || this, respModel, xhr, respOpts);
        }
      });
    },

    modelResolved: function(options) {
      options = options || {};

      if (!options.model) throw new Error('model must be specified');

      return (options.model.resolved);
    },

    resolveModel: function(options) {
      options = options || {};

      if (!options.model) throw new Error('model must be specified');

      if (!options.model.id) throw new Error('model id not initialized');

      if (this.modelResolved(options)) return;

      Twendai.Cache.Models[options.model.id] = options.model;

      options.model.resolved = true;
      options.model.resolvecomplete();
    },

    unresolveModel: function(options) {
      var model;
      options = options || {};

      if (!options.model) throw new Error('model must be specified');

      if (!options.model.id) throw new Error('model id not initialized');

      model = Twendai.Cache.Models[options.model.id];

      if (!model) return;

      model.resolved = false;
    },

    getModel: function(options) {
      var id, model, cachedModels;

      var bbOpts = {};

      options = options || {};

      if (!options.id) throw new Error('id must be specified');
      id = options.id;

      cachedModels = Twendai.Cache.Models;
      model = cachedModels[id];

      if (model) return model;

      if (!options.type) throw new Error('type must be specified');
      model = new options.type();

      model.instanceId = T.U.randomId();
      model.resolved = false;
      cachedModels[id] = model;
      model.on('destroy', function(delModel) {
        delete cachedModels[delModel.id];
      });

      bbOpts.success = function(respModel, resp, respOpts) {
        model.resolved = true;
        model.fetchcomplete(respModel, resp, respOpts);
        model.resolvecomplete();

        Twendai.ViewUtil.loadingDone();
        if (options.success) options.success.call(this, respModel, resp, respOpts);
      };

      bbOpts.error = function(respModel, xhr, respOpts) {
        log.error('fetch failed: modelId:' + id);
        Twendai.ViewUtil.loadingDone();
        model.errorhappened(respModel, xhr, respOpts);
        if (options.error) options.error.call(this, respModel, xhr, respOpts);
      };

      if (options.url) bbOpts.url = options.url;

      model.fetch(bbOpts);
      Twendai.ViewUtil.loadingInProgress();

      return model;
    },

    refreshModel: function(options) {
      var id, model, cachedModels;

      var bbOpts = {};

      options = options || {};

      if (!options.id) throw new Error('id must be specified');
      id = options.id;

      cachedModels = Twendai.Cache.Models;
      model = cachedModels[id];

      if (!model) throw new Error('cannot refresh a model that is not cached');

      bbOpts.success = function(respModel, resp, respOpts) {
        model.refreshcomplete(respModel, resp, respOpts);

        Twendai.ViewUtil.loadingDone();
        if (options.success) options.success.call(this, respModel, resp, respOpts);
      };

      bbOpts.error = function(respModel, xhr, respOpts) {
        log.error('model refresh failed: modelId:' + id);
        Twendai.ViewUtil.loadingDone();
        model.errorhappened(respModel, xhr, respOpts);
        if (options.error) options.error.call(this, respModel, xhr, respOpts);
      };

      if (options.url) bbOpts.url = options.url;
      model.fetch(bbOpts);
      Twendai.ViewUtil.loadingInProgress();

      return model;
    },

    modelExists: function(options) {
      options = options || {};

      if (!options.id) throw new Error('id must be specified');

      return Twendai.Cache.Models[options.id];
    },

    createCollection: function(options) {
      var collection;

      options = options || {};
      if (!options.name || !options.type) throw new Error('name and type must be specified');
      if ((options.local === true) && (options.localDeferred === true)) {
        throw new Error('local and localDeferred cannot both be true');
      }

      collection = new options.type();
      collection.name = options.name;
      collection.instanceId = T.U.randomId();

      if ((options.local === true) || (options.localDeferred === true)) {
        collection.local = true;
      }

      // local collections are resolved by definition
      if (options.local === true) {
        collection.resolved = true;
      } else {
        collection.resolved = false;
      }

      Twendai.Cache.Collections[options.name] = collection;

      return collection;
    },

    delCollection: function(options) {
      var collection;

      options = options || {};
      if (!options.name) throw new Error('name must be specified');

      collection = Twendai.Cache.Collections[options.name];
      if (!collection) return;

      // Collection could still be around, atleast until GC
      collection.resolved = false;
      collection.reset();

      delete Twendai.Cache.Collections[options.name];
    },

    collectionResolved: function(options) {
      var collection;
      options = options || {};

      if (!options.name) throw new Error('name must be specified');

      collection = Twendai.Cache.Collections[options.name];

      if (!collection) return false;

      return (collection.resolved);
    },

    collectionExists: function(options) {
      options = options || {};

      if (!options.name) throw new Error('name must be specified');

      return (!_.isUndefined(Twendai.Cache.Collections[options.name]));
    },

    resolveCollection: function(options) {
      options = options || {};

      if (!options.collection) throw new Error('collection must be specified');

      options.collection.resolved = true;
      options.collection.resolvecomplete();
    },

    unresolveCollection: function(options) {
      var collection;
      options = options || {};

      if (!options.name) throw new Error('name must be specified');

      collection = Twendai.Cache.Collections[options.name];

      if (!collection) return;

      collection.resolved = false;
    },

    getCollection: function(options) {
      var name, cachedColls, collection;
      var bbOpts = {};

      options = options || {};

      if (!options.name) throw new Error('name must be specified');
      name = options.name;

      cachedColls = Twendai.Cache.Collections;
      collection = cachedColls[name];

      if (!_.isUndefined(collection)) {
        if (collection.local === true) return collection;

        if (options.refresh === true) {
          if (!_.isUndefined(collection.url) && !_.isUndefined(options.url) &&
              (collection.url !== options.url)) {
            throw new Error('collection url change: ' + collection.url + ' -> ' + options.url);
          }

          if (collection.getPending) return collection;

          collection.resolved = false;
        } else {
          if (collection.resolved || collection.getPending) return collection;
        }
      } else {
        if (!options.type) {
          throw new Error('getting collection failed: coll type not specified');
        }

        if ((options.local === true) || (options.localDeferred === true)) {
          throw new Error('use createCollection for local and localDeferred');
        }

        collection = new options.type();

        collection.name = name;
        collection.resolved = false;
        collection.instanceId = T.U.randomId();
        cachedColls[name] = collection;
      }

      bbOpts.success = function(respColl, resp, respOpts) {
        Twendai.ViewUtil.loadingDone();

        collection.getPending = false;
        collection.resolved = true;
        collection.fetchcomplete(respColl, resp, respOpts);
        collection.resolvecomplete();

        if (options.success) options.success.call(this, respColl, resp, respOpts);
      };

      bbOpts.error = function(respColl, xhr, respOpts) {
        log.error('collection: ' + name + ' fetch failed');
        Twendai.ViewUtil.loadingDone();

        collection.errorhappened(respColl, xhr, respOpts);
        if (options.error) options.error.call(this, respColl, xhr, respOpts);
      };

      if (options.url) collection.url = bbOpts.url = options.url;
      collection.getPending = true;
      collection.fetch(bbOpts);

      Twendai.ViewUtil.loadingInProgress();

      return collection;
    },

    refreshCollection: function(options) {
      return this.getCollection(_.extend(options, {refresh: true}));
    },

    getCollectionModel: function(options) {
      var model;

      options = options || {};
      if (!options.collName) {
        throw new Error('getting coll model failed: coll name not specified');
      }

      var cachedColl = Twendai.Cache.Collections[options.collName];
      if (!cachedColl) {
        throw new Error('getting coll model failed: coll not found');
      }

      model = cachedColl.get(options.modelKey);

      return model;
    },

    isCollectionModel: function(options) {
      return (!!this.getCollectionModel(options));
    },

    refreshCollectionModel: function(options) {
      var id, model, cachedModels, cachedColl;

      var bbOpts = {};

      options = options || {};

      if (!options.collName) throw new Error('collName must be specified');
      if (!options.modelKey) throw new Error('modelKey must be specified');

      cachedColl = Twendai.Cache.Collections[options.collName];
      if (!cachedColl) throw new Error('refreshing coll model failed: cachedColl not found');

      model = cachedColl.get(options.modelKey);
      if (!model) throw new Error('refreshing coll model failed: model not found');

      id = model.get('id');
      bbOpts.success = function(respModel, resp, respOpts) {
        log.debug('coll model refreshed: modelId:' + id);
        model.refreshcomplete(respModel, resp, respOpts);

        Twendai.ViewUtil.loadingDone();
        if (options.success) options.success.call(this, respModel, resp, respOpts);
      };

      bbOpts.error = function(respModel, xhr, respOpts) {
        log.error('coll model refresh failed: modelId:' + id);
        Twendai.ViewUtil.loadingDone();
        model.errorhappened(respModel, xhr, respOpts);
        if (options.error) options.error.call(this, respModel, xhr, respOpts);
      };

      if (options.url) bbOpts.url = options.url;
      log.debug('refreshing coll model: modelId:' + id);
      model.fetch(bbOpts);
      Twendai.ViewUtil.loadingInProgress();

      return model;
    },

    findCollectionModel: function(options) {
      var collection;

      options = options || {};
      if (!options.collName || !options.modelAttr || !options.modelAttrVal) {
        throw new Error('collName, modelAttr and modelAttrVal must be specified');
      }

      collection = this.getCollection({name: options.collName});
      return collection.find(function(model){
        return (model.get(options.modelAttr) === options.modelAttrVal);
      });
    },

    addCollectionModel: function(options) {
      var cachedColl;

      options = options || {};

      if (!options.collName || !options.model) {
        throw new Error('collName and model must be specified');
      }

      cachedColl = Twendai.Cache.Collections[options.collName];
      if (!cachedColl) {
        throw new Error('adding coll model failed: unable to find coll');
      }

      if (_.isUndefined(options.index)) {
        cachedColl.add(options.model, {merge: true});
      } else {
        cachedColl.add(options.model, {at: options.index, merge: true});
      }
    },

    delCollectionModel: function(options) {
      var cachedColl;

      options = options || {};
      if (!options.collName) {
        throw new Error('deleting coll model failed: coll name not specified');
      }

      if (!options.model) {
        throw new Error('deleting coll model failed: model not specifed');
      }

      cachedColl = Twendai.Cache.Collections[options.collName];
      if (!cachedColl) {
        throw new Error('deleting coll model failed: unable to find coll');
      }

      if (_.isUndefined(options.silent)) {
        cachedColl.remove(options.model);
      } else {
        cachedColl.remove(options.model, {silent: options.silent});
      }
    },

    getPageSource: function(options) {
      var that, pageSourceModel;
      
      options = options || {};
      
      if (_.isUndefined(options.url)) throw new Error('url must be specified');

      if (options.cache) { 
        pageSourceModel = this.getCollectionModel({
          collName: 'PageSource',
          modelKey: options.url
        });
  
        if (pageSourceModel) return pageSourceModel;
      }

      pageSourceModel = this.createModel({
        type: Twendai.Models.PageSource
      });

      that = this;
      pageSourceModel.save({url: options.url}, {
        url: '/pagesource',
        success: function(respModel, resp, respOpts) {
          var tagDistributionColl;
          
          tagDistributionColl = that.createCollection({
            type: Twendai.Collections.TagDistribution,
            name: 'TagDistribution' + options.url,
            local: true
          });
          
          _.each(respModel.get('tagDistribution'), function(tagDist) {
            var tagDistributionModel;
            
            tagDistributionModel = that.createModel({
              type: Twendai.Models.TagDistribution,
              id: options.url + tagDist.tag,
              local: true
            });
            
            tagDistributionModel.set('tag', tagDist.tag);
            tagDistributionModel.set('count', tagDist.count);
              
            tagDistributionColl.add(tagDistributionModel);
          });
          
          if (options.cache) {
            that.addCollectionModel({
              collName: 'PageSource',
              model: respModel
            });
          }
          that.resolveModel({model: respModel});
          if (options.success) options.success.call(options.context || this, respModel, resp, respOpts);
        },
        error: function(respModel, xhr, respOpts) {
          log.error('obtaining page source failed');
          if (options.error) options.error.call(options.context || this, respModel, xhr, respOpts);
        }
      });
      
      return pageSourceModel;
    },
    
    getPageSourceTags: function(options) {
      options = options || {};
      
      if (_.isUndefined(options.url)) throw new Error('url must be specified');
      
      return this.getCollection({
        name: 'TagDistribution' + options.url        
      });
    }
    
  });

  Twendai.T.D = Twendai.DataService;

  return Twendai;
});
