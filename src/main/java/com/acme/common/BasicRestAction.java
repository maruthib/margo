package com.acme.common;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.Callable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import javax.servlet.http.HttpServletRequest;
import org.apache.struts2.interceptor.ServletRequestAware;

import com.acme.common.CompoundResult;
import com.acme.service.GsonJsonServiceImpl;
import com.acme.service.JsonService;
import com.acme.common.HttpMethod;

public abstract class BasicRestAction extends BasicAction implements ServletRequestAware {
  private static final Logger log = LoggerFactory.getLogger(BasicRestAction.class);
  private static final JsonService jsonSvc = GsonJsonServiceImpl.I;
  private transient HttpServletRequest request;
  private transient HttpMethod method;
  private transient StringBuffer contentBuf;
  
  public void setServletRequest(HttpServletRequest httpSRequest) {
    this.request = httpSRequest;
    method = HttpMethod.fromString(request.getMethod());

    if ((method != HttpMethod.POST) && (method != HttpMethod.PATCH) && (method != HttpMethod.PUT))
      return;
    
    try {
      contentBuf = ServletUtil.readContent(request);
    } catch (IOException e) {
      log.error("reading request content failed", e);
    }
  }
  
  @SuppressWarnings("unchecked")
  public Map<String, Object> getPostContent() {
    return (Map<String, Object>) jsonSvc.naturalFromJson(contentBuf.toString());    
  }
  
  public <T> T getPostContent(Class<T> clazz) {
    return jsonSvc.fromJson(contentBuf.toString(), clazz);
  }
  
  public String callAction(Map<HttpMethod, Callable<String>> restMap) {
    HttpMethod reqMethod;
    try {
      reqMethod = HttpMethod.fromString(request.getMethod());
    } catch (IllegalArgumentException e) {
      log.error("resolving http method failed");
      return ActionResult.Generic.FAILURE;
    }
    
    Callable<String> action = restMap.get(reqMethod);
    String result;
    try {
      result = action.call();
    } catch (Exception e) {
      log.error("calling method mapped action failed: ", e);
      return ActionResult.Generic.FAILURE;
    }
    
    return result;
  }
  
  public HttpMethod getMethod() {
    return method;
  }
  
  public void assertCompoundResult(CompoundResult cr) {
    if (!cr.isSuccess()) throw new RuntimeException();
  }
  
}
