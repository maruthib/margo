define([
  'log4javascript'
  ], function (log4javascript) {
  'use strict';

  var loggerType = 'console';
  var wsMode = 'DEVELOPMENT';
  var logLevel = log4javascript.Level.DEBUG; 

  var pa = new log4javascript.PopUpAppender();
  
  function init() {
    var appender;
    
    if (loggerType === 'popup') {
      appender = new log4javascript.PopUpAppender(); 
    } else {
      appender = new log4javascript.BrowserConsoleAppender(); 
    }
    
    appender.setThreshold(logLevel);
    appender.setLayout(new log4javascript.PatternLayout("%d{HH:mm:ss} %-5p - %c: %m{1}"));
    
    log4javascript.getRootLogger().addAppender(appender);    
  }
  
  function getLogger(loggerName, level) {
    var logger;
    
    if (wsMode !== 'DEVELOPMENT') {
      logger = log4javascript.getLogger(loggerName);
      logger.setLevel(log4javascript.Level.ERROR);
      return logger;
    }
    
    logger = log4javascript.getLogger(loggerName);
    if (typeof level !== 'undefined') {
      logger.setLevel(strToLogLevel(level));
    } else {
      logger.setLevel(strToLogLevel('debug'));
    }
    
    return logger;
  }
  
  function setWsMode(wsModeStr) {
    wsMode = wsModeStr;
  }
  
  function strToLogLevel(level) {
    var log4jsLevel;
    
    if (typeof level === 'undefined') return log4javascript.Level.ALL;
    
    switch(level) {
    case 'error':
      log4jsLevel = log4javascript.Level.ERROR;
      break;

    case 'warn':
      log4jsLevel = log4javascript.Level.WARN;
      break;
      
    case 'info':
      log4jsLevel = log4javascript.Level.INFO;
      break;

    case 'debug':
      log4jsLevel = log4javascript.Level.DEBUG;
      break;
      
    case 'trace':
      log4jsLevel = log4javascript.Level.TRACE;
      break;

    case 'all':
      log4jsLevel = log4javascript.Level.ALL;
      break;
      
    default:
      log4jsLevel = log4javascript.Level.ALL;
      break;
    }
    
    return log4jsLevel;
  }
  
  init();
  
  return {
    getLogger: getLogger,
    setWsMode: setWsMode
  };
});