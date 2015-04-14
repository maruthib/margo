package com.acme.common;

public abstract class ActionResult {
  public ActionResult() {
  }

  public static class Generic {
    public static final String BB_APP = "bbApp";
    public static final String BB_APP_MOB = "bbAppMob";    
    public static final String SPA = "spa";
    public static final String SUCCESS = "success";
    public static final String FAILURE = "failure";
    public static final String REDIRECT = "redirect";
    public static final String REDIRECT_HTTPS_AWS = "redirectHttpsAWS";
    public static final String ERROR = "error";
    public static final String STREAM = "stream";
    public static final String OCTET_STREAM = "octetStream";    
    public static final String INTERCEPTED = "intercepted";
    public static final String INTERNAL_FAILURE = "internalFailure";
    public static final String SVC_UNAVAIL = "serviceUnavailable";
    public static final String JSREQ = "jsreq";

    public static final String HTTP_OK = "httpOk";
    public static final String JSON_HTTP_OK = "jsonHttpOk";
    public static final String HTTP_INTERNAL_FAILURE = "httpInternalFailure";
    
    public static final String NOT_MODIFIED = "notModified";    
    public static final String NOT_FOUND = "notFound";
    public static final String INVALID_METHOD = "invalidMethod";
    public static final String INVALID_URL = "invalidUrl";
    public static final String UNAUTHORIZED = "unauthorized";
    public static final String BAD_REQUEST = "badrequest";    
    public static final String FORBIDDEN = "forbidden";
    public static final String GET_SUCCESS = "getSuccess";
    public static final String GET_FAILURE = "getFailure";
    public static final String POST_SUCCESS = "postSuccess";
    public static final String POST_FAILURE = "postFailure";
    public static final String DELETE_SUCCESS = "delSuccess";
    public static final String DELETE_FAILURE = "delFailure";    
  }
  
  public static class Redirect {
    public static final String HOME = "redirHome";
  }
  
  public static class Ajax {
    public static final String STREAM = "stream";
  }
  
  public static class Template {
    public static final String MAIN = "main";
    public static final String HEADER = "header";    
  }
  
}
