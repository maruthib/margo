define([
  'twendai',
  'lodash'
],

function(Twendai, _) {
  'use strict';

  var CloudConfigModel = Twendai.Model.extend({
    urlRoot: '/cloudconfig'
  });

  var PageSourceModel = Twendai.Model.extend({});

  var PageSourceCollection = Twendai.Collection.extend({
    model: PageSourceModel
  });
  
  var TagDistributionModel = Twendai.Model.extend({});
  
  var TagDistributionCollection = Twendai.Collection.extend({
    model: TagDistributionModel
  });
  
  _.extend(Twendai.Models, {
    CloudConfig: CloudConfigModel,
    PageSource: PageSourceModel,
    TagDistribution: TagDistributionModel
  });
  
  _.extend(Twendai.Collections, {
    PageSource: PageSourceCollection,
    TagDistribution: TagDistributionCollection
  });
  
  return Twendai; 
});
