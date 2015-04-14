function initError() {
  'use strict';

  var consts = Twendai.Constants;
  var ajax = {};
  ajax.errorState = consts.errorState.NONE;

  $(document).ajaxSuccess(function(e, jqXHR, ajaxSettings) {
    switch (ajax.errorState) {
    case consts.errorState.NONE:
    case consts.errorState.UNAUTHEN:
      return;

    case consts.errorState.BROKEN_LINK:
      Twendai.Alert.clearAlert();

      if (!_.isUndefined(ajax.errorTimer)) {
        window.clearInterval(ajax.errorTimer);
        delete ajax.errorTimer;
      }

      Twendai.Alert.showAlert({
        desc : "... and we are back",
        type : 'info',
        closeOnClick : true,
        alertTimeout: Twendai.Constants.USER_ATTN_DELAY
      });

      ajax.errorState = consts.errorState.NONE;
      return;
    }
  });

  $(document).ajaxError(function(e, jqXHR, ajaxSettings, thrownError) {
    var desc;

    if (jqXHR.status === 0) {
      switch (ajax.errorState) {
      case consts.errorState.BROKEN_LINK:
      case consts.errorState.UNAUTHEN:
        return;

      case consts.errorState.NONE:
        ajax.errorDownCnt = twendai.env.cfg.tetherInterval / 1000;
        ajax.errorTimer = window.setInterval(function() {
          desc = 'Unable to reach server,';
          if (ajax.errorDownCnt === -1) {
            desc += ' not restored';
          } else if (ajax.errorDownCnt === 0) {
            desc += ' trying now';
          } else if (ajax.errorDownCnt === 1) {
            desc += (' retry in ' + ajax.errorDownCnt + ' second');
          } else {
            desc += (' retry in ' + ajax.errorDownCnt + ' seconds');
          }
          Twendai.Alert.showAlert({
            desc : desc,
            type : 'error',
            closeOnClick : false,
            alertTimeout: Twendai.Constants.USER_ALERT_TIMEOUT,
            doNotClear: true,
            noClose: true
          });

          ajax.errorDownCnt--;
          if (ajax.errorDownCnt === -2) {
            ajax.errorDownCnt = twendai.env.cfg.tetherInterval / 1000;
          }
        }, 1000);

        ajax.errorState = consts.errorState.BROKEN_LINK;
        return;
      }
    } else if (jqXHR.status === 401) {
      switch (ajax.errorState) {
      case consts.errorState.UNAUTHEN:
        return;

      case consts.errorState.NONE:
      case consts.errorState.BROKEN_LINK:
        Twendai.Alert.clearAlert();
        if (!_.isUndefined(ajax.errorTimer)) {
          window.clearInterval(ajax.errorTimer);
          delete ajax.errorTimer;
        }

        ajax.errorDownCnt = 3;
        ajax.errorTimer = window.setInterval(function() {
          desc = 'Session expired, please login again. Redirecting...';
          Twendai.Alert.showAlert({
            desc : desc,
            type : 'warning',
            closeOnClick : false,
            alertTimeout: Twendai.Constants.USER_ALERT_TIMEOUT,
            doNotClear: true,
            noClose: true
          });

          ajax.errorDownCnt--;
          if (ajax.errorDownCnt === 0) {
            location.replace(location.protocol + '//' + location.host + Twendai.root);
            window.clearInterval(ajax.errorTimer);
            delete ajax.errorTimer;
          }
        }, 1000);

        ajax.errorState = consts.errorState.UNAUTHEN;
        return;
      }
    }
  });
}

function initMarionette(options) {
  'use strict';

  var $ = options.$;
  var Handlebars = options.Handlebars;
  var Twendai = options.Twendai;
  
  Backbone.Marionette.TemplateCache.prototype.loadTemplate = function(templateId) {
    var scrId, scrJQ, done, result;
    var scrPrefix = 'script!';
    var inlinePrefix = 'inline!';
    
    if (templateId.indexOf(inlinePrefix) === 0) {
      return templateId.substring(inlinePrefix.length);
    }
    
    if (templateId.indexOf(scrPrefix) === 0) {
      scrId = templateId.substring(scrPrefix.length);
      scrJQ = $('#' + scrId);
      if (scrJQ !== null) {
        result = scrJQ.html();
        return result;
      }

      // PATTERN: Converting async calls to sync 
      /*
       * Obtaining a template dynamically from the server. This is not recommended due to network 
       * delay affecting UX. Preload templates. The code is left in place to serve as an example 
       * for async conversion, and with the minor possibility of dynamic loading infreq templates.
       */
      done = this.async();
      $.get(Twendai.root + 'app/templates/' + scrId, function(response) {
        done(result = response);
      });
      
      return result;
    }
  };
  
  Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(template) {
    return Handlebars.compile(template);
  };
  
  Backbone.Marionette.Renderer.render = function(template, data) {
    return Backbone.Marionette.TemplateCache.get(template)(data);
  };
  
  Backbone.Marionette.Region.prototype.open = function(view) {
    if (view.effect) {
      this.$el.hide();
      this.$el.html(view.el);
      this.$el.slideDown('fast');
    } else {
      this.$el.empty().append(view.el);      
    }
  };
}

function initHandlebars() {
  'use strict';

  Handlebars.registerHelper('compare', function (lvalue, operator, rvalue, options) {
    var operators, result;
    
    if (arguments.length < 3) throw new Error('must specify two params');
    
    if (_.isUndefined(options)) {
      options = rvalue;
      rvalue = operator;
      operator = '===';
    }

    operators = {
      /* jshint eqeqeq:false */
      '==': function (l, r) { return l == r; },
      '===': function (l, r) { return l === r; },
      '!=': function (l, r) { return l != r; },
      '!==': function (l, r) { return l !== r; },
      '<': function (l, r) { return l < r; },
      '>': function (l, r) { return l > r; },
      '<=': function (l, r) { return l <= r; },
      '>=': function (l, r) { return l >= r; },
      '&&': function(l, r) { return l && r; },
      '||': function(l, r) { return l || r; },
      'typeof': function (l, r) { return typeof l == r; }
    };
    
    if (!operators[operator]) throw new Error('unknown operator: ' + operator);
    
    result = operators[operator](lvalue, rvalue);
    
    if (result) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });
  
  Handlebars.registerHelper('breaklines', function(text) {
    text = Handlebars.Utils.escapeExpression(text);
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    return new Handlebars.SafeString(text);
  });
  
  Handlebars.registerHelper('hashtag', function(text) {
    text = Handlebars.Utils.escapeExpression(text);
    text = text.replace(/(^|\W)(#[a-z\d][\w-]*)/ig, '$1<span class="skn-font-hashtag">$2</span>');
    return new Handlebars.SafeString(text);
  });
  
  Handlebars.registerHelper('comment', function(text) {
    if (_.isUndefined(text)) return '';
    
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    text = text.replace(/(^|\W)(#[a-z\d][\w-]*)/ig, '$1<span class="skn-font-hashtag">$2</span>');
    text = text.replace(/(^|\W)(@[a-z\d][\w-]*)/ig, '$1<span class="skn-font-twen">$2</span>');    
    return new Handlebars.SafeString(text);    
  });
  
}

function initApp(options) {
  'use strict';

  initError();
  initMarionette(options);
  initHandlebars();
}

function activateHistory(options) {
  'use strict';

  var Twendai = options.Twendai;
  
  // Trigger the initial route and enable HTML5 History API support, set the
  // root folder to '/' by default.  Change in twendai.js.
  Backbone.history.start({ pushState: true, root: Twendai.root });

  // All navigation that is relative should be passed through the navigate
  // method, to be processed by the router. If the link has a `data-bypass`
  // attribute, bypass the delegation completely.
  $(document).on('click', 'a[href]:not([data-bypass])', function(evt) {
    // Get the absolute anchor href.
    var href = { prop: $(this).prop('href'), attr: $(this).attr('href') };

    /*
     * Getting href prop of an svg:a xlink:href does not return full path.
     * It returns an SVGAnimatedString object which has only animVal and
     * baseVal attributes neither of which gives the full path.
     *
     * When full path is specified in xlink:href of an svg:a link, clicking
     * on the corresponding element bypasses this code. So, construct href
     * prop using window location
     */
    var baseVal = $(this).prop('href').baseVal;
    if ((typeof baseVal !== 'undefined') && (baseVal === href.attr)) {
      href.prop = location.protocol + '//' + location.host + Twendai.root + baseVal;
    }

    // Get the absolute root.
    var root = location.protocol + '//' + location.host + Twendai.root;
    // Ensure the root is part of the anchor href, meaning it's relative.
    if (href.prop.slice(0, root.length) === root) {
      // Stop the default event to ensure the link will not cause a page
      // refresh.
      evt.preventDefault();

      // `Backbone.history.navigate` is sufficient for all Routers and will
      // trigger the correct events. The Router's internal `navigate` method
      // calls this anyways.  The fragment is sliced from the root.
      Backbone.history.navigate(href.attr, true);
    }
  });

}

define(
  [
   'twendai',
   'log4js',
   'router'
  ],

  function (Twendai, Log, Router) {
    'use strict';
    
    _.extend(Twendai, {
      root: '/'
    });
    
    var log = Log.getLogger('app');
    
    Twendai.addInitializer(initApp);    
    Twendai.on('initialize:after', function(options) {
      Twendai.Router = new Router();        

      Twendai.vent.on('initroutes:done', function() {
        activateHistory(options);
      });
    });
    
    return Twendai;
});
