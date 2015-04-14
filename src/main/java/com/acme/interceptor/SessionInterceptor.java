package com.acme.interceptor;

import com.opensymphony.xwork2.ActionInvocation;
import com.opensymphony.xwork2.interceptor.AbstractInterceptor;

public class SessionInterceptor extends AbstractInterceptor {
  @Override
  public String intercept(ActionInvocation invocation) {
     return InterceptorHelper.restInvoke(invocation);    
  }

}