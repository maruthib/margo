package com.acme.interceptor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.opensymphony.xwork2.ActionInvocation;

import com.acme.common.ActionResult;
import com.acme.exception.*;
import com.acme.exception.InternalServerException;

public class InterceptorHelper {
  private static final Logger log = LoggerFactory.getLogger(InterceptorHelper.class);
  
  public static String restInvoke(ActionInvocation invocation) {
    try {
      return invocation.invoke();
    } catch (InternalServerException e) {
      log.error("internal server exception", e);
      return ActionResult.Generic.INTERNAL_FAILURE;
    } catch (BadRequestException e) {
      log.error("bad request exception", e);
      return ActionResult.Generic.BAD_REQUEST;
    } catch(RuntimeException e) {
      log.error("internal server exception", e);
      return ActionResult.Generic.INTERNAL_FAILURE;
    } catch (Exception e) {
      log.error("invocation exception", e);
      return ActionResult.Generic.INTERNAL_FAILURE;
    }
    
  }
}
