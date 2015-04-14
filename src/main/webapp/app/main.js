require([
  'jquery',
  'handlebars',  
  'app',
  'router'
],

function($, Handlebars, Twendai, Router) {
  'use strict';

  Twendai.start({
    $: $,
    Handlebars: Handlebars,
    Twendai: Twendai,
    Router: Router
  });
});
