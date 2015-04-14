package com.acme.test;

import org.junit.rules.MethodRule;
import org.junit.runners.model.FrameworkMethod;
import org.junit.runners.model.Statement;

import static com.acme.test.AssertAndLogJUnit.*;

public class CatchAllExceptionsRule implements MethodRule {
  
  public Statement apply(final Statement base, FrameworkMethod method, Object target) {
    final String methodName = method.getName();
    
    return new Statement() {
      public void evaluate() {
        before(methodName);
        try {
          base.evaluate();
        } catch (Throwable e) {
          failAndLog("Exception occurred when evaluating test method:" + methodName, e);
        } finally {
          after(methodName);
        }
      }
    };
  }
  
  protected void before(String methodName) {
    justLog("---------------- BEGIN " + methodName + " ------------------");
  }
  
  protected void after(String methodName) {
    justLog("================ END " + methodName + " =================");    
  }

}
