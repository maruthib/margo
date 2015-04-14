define([
  'twendai',
  'jquery',
  'lodash',
  'log4js',
  'alert'
],

function(Twendai, $, _, Log) {
  'use strict';
  
  var log = Log.getLogger('tags');
  var T = Twendai.abbreviate();

  var UrlLayout = Twendai.Layout.extend({
    template: 'script!url-template',

    events: {
      'click #url-go': 'processUrl',
      'keydown #url-url': 'onUrlKeyDown'
    },
    
    processUrl: function() {
      var url = $('#url-url').val().trim();
      
      T.A.clearAlert();
      if (url === '') {
        T.A.showAlert({
          desc: 'Enter a valid URL',
          type: 'error'
        });
        return;
      }
      
      if ((url.indexOf('http://') !== 0) && (url.indexOf('https://') !== 0)) {
        url = 'http://' + url;
      }
      
      Twendai.Router.trigger('pagesource:get', url);
      
      T.D.getPageSource({
        url: url,
        success: function() {
          Twendai.Router.trigger('pagesource:getcomplete', url);
        },
        error: function(respModel, xhr) {
          if (xhr.status === 400) {
            T.A.showAlert({
              desc: 'Could not get source. Invalid URL possibly. Sorry!',
              type: 'error'
            });
          } else if (xhr.status === 500) {
            T.A.showAlert({
              desc: 'Something went wrong. Sorry!',
              type: 'error'
            });
          }
        }
      });    
    },
    
    onUrlKeyDown: function(event) {
      if (T.U.isEnter(event)) {
        this.processUrl();
      }
    }
  });
  
  var TagItemView = Twendai.ItemView.extend({
    template: 'script!tag-item-template',
    
    events: {
      'click [data-elem="tag-item"]': 'onTagClick'
    },
    
    onTagClick: function(event) {
      var tag, $tagItem;
      var $elem = $(event.target);

      if ($elem.attr('data-elem')) {
        tag = $elem.attr('data-value'); 
      } else {
        tag = $elem.parent().attr('data-value');
      }

      if (T.S.selectedTag) {
        $('#' + T.S.selectedTag + '-item').removeClass('skn-green').addClass('skn-yellow bhv-click');
        $('[data-tagtype="' + T.S.selectedTag + '-tag"]').removeClass('skn-green skn-font-white');
        $('[data-tagtype="' + T.S.selectedTag + '-endtag"]').removeClass('skn-gray skn-font-white');        
      }

      T.S.selectedTag = tag;
      $('#' + tag + '-item').removeClass('skn-yellow bhv-click').addClass('skn-green');
      $('[data-tagtype="' + tag + '-tag"]').addClass('skn-green skn-font-white');      
      $('[data-tagtype="' + tag + '-endtag"]').addClass('skn-gray skn-font-white');            
    }
  });
  
  var TagsCollView = Twendai.CollectionView.extend({
    itemView: TagItemView
  });
  
  var PageSourceView = Twendai.ItemView.extend({
    template: 'script!pagesource-template',
    
    initialize: function(options) {
      options = options || {};
    },
    
    onRender: function() {
      var that = this;
      _.defer(function() {
        $('#pgs-container').html(that.model.get('source'));        
      });

    }
  });
  
  var PageTagsLayout = Twendai.Layout.extend({
    template: 'script!tags-layout',
    regions: {
      url: '#plg-url',
      tags: '#plg-tags',
      src: '#plg-src'
    },
    
    onRender: function() {
      var pageSourceModel, that;
      var urlModel = new Twendai.Model();
      
      urlModel.set('url', this.options.url);
      
      this.url.show(new UrlLayout({model: urlModel}));

      if (_.isUndefined(this.options.getcomplete)) {
        this.tags.show(T.V.getEmptyLayout());
        this.src.show(T.V.getEmptyLayout());
        return;
      }
      
      this.tags.show(new TagsCollView({
        collection: T.D.getPageSourceTags({url: this.options.url})
      }));
      
      that = this;
      pageSourceModel = T.D.getPageSource({
        url: this.options.url,
        success: function() {
          that.src.show(new PageSourceView({model: pageSourceModel}));
        },
        error: function(respModel, xhr) {
          if (xhr.status === 400) {
            T.A.showAlert({
              desc: 'Could not get source. Invalid URL possibly. Sorry!',
              type: 'error'
            });
          } else if (xhr.status === 500) {
            T.A.showAlert({
              desc: 'Something went wrong. Sorry!',
              type: 'error'
            });
          }
        }
      });
    }
  });

  return _.extend(Twendai.Layouts, {
    PageTags: PageTagsLayout
  });
});
  
