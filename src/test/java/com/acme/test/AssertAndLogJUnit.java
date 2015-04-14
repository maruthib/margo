package com.acme.test;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hamcrest.Matcher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static org.junit.Assert.*;
import static org.hamcrest.Matchers.*;

public class AssertAndLogJUnit {
  private static final Logger log = LoggerFactory.getLogger(AssertAndLogJUnit.class);
  private static final String LOG_SUFFIX = " completed";

  private static String getLocation(Boolean helper) {
    int frameNum = helper ? 4 : 3;
    
    String fileName = Thread.currentThread().getStackTrace()[frameNum].getFileName();
    int lineNo = Thread.currentThread().getStackTrace()[frameNum].getLineNumber();

    return (fileName + "[" + lineNo + "]: ");
  }
  
  public static void assertTrueAndLog(String assertTitle, Boolean bool) {
    assertTrue(assertTitle, bool);
    log.info(getLocation(Boolean.FALSE) + assertTitle + LOG_SUFFIX);
  }

  public static void assertFalseAndLog(String assertTitle, Boolean bool) {
    assertFalse(assertTitle, bool);
    log.info(getLocation(Boolean.FALSE) + assertTitle + LOG_SUFFIX);
  }

  public static void assertNullAndLog(String assertTitle, Object obj) {
    assertNull(assertTitle, obj);
    log.info(getLocation(Boolean.FALSE) + assertTitle + LOG_SUFFIX); 
  }
  
  public static void assertNotNullAndLog(String assertTitle, Object obj) {
    assertNotNull(assertTitle, obj);
    log.info(getLocation(Boolean.FALSE) + assertTitle + LOG_SUFFIX); 
  }
  
  public static void assertEqualsAndLog(String assertTitle, Object expected, Object actual) {
    assertEquals(assertTitle, expected, actual);
    log.info(getLocation(Boolean.FALSE) + assertTitle + LOG_SUFFIX);
  }
  
  public static void failAndLog(String message) {
    log.error(getLocation(Boolean.FALSE) + message);    
    fail(message);
  }
  
  public static void failAndLog(String message, Throwable e) {
    log.error(getLocation(Boolean.FALSE) + message, e);
    fail(message);
  }
  
  public static <T> void assertEqualsEitherAndLog(String message, T obj, T one, T other) {
    assertThat(message, obj, anyOf(equalTo(one), equalTo(other)));
  }
  
  public static void assertTrueAndLog(String assertTitle, Boolean assertion, Boolean helper) {
    assertTrue(assertTitle, assertion);
    log.info(getLocation(helper) + assertTitle + LOG_SUFFIX);
  }

  public static void assertFalseAndLog(String assertTitle, Boolean assertion, Boolean helper) {
    assertFalse(assertTitle, assertion);
    log.info(getLocation(helper) + assertTitle + LOG_SUFFIX);
  }

  public static void assertNullAndLog(String assertTitle, Object obj, Boolean helper) {
    assertNull(assertTitle, obj);
    log.info(getLocation(helper) + assertTitle + LOG_SUFFIX); 
  }
  
  public static void assertNotNullAndLog(String assertTitle, Object obj, Boolean helper) {
    assertNotNull(assertTitle, obj);
    log.info(getLocation(helper) + assertTitle + LOG_SUFFIX); 
  }
  
  public static void assertEqualsAndLog(String assertTitle, Object expected, Object actual,
      Boolean helper) {
    assertEquals(assertTitle, expected, actual);
    log.info(getLocation(helper) + assertTitle + LOG_SUFFIX);
  }
  
  public static void failAndLog(String message, Boolean helper) {
    log.error(getLocation(helper) + message);    
    fail(message);
  }
  
  public static void failAndLog(String message, Throwable e, Boolean helper) {
    log.error(getLocation(helper) + message, e);
    fail(message);
  }
  
  public static void justLog(String message, Boolean helper) {
    log.info(getLocation(helper) + message);    
  }
  
  public static void justLog(String message) {
    log.info(getLocation(Boolean.FALSE) + message);
  }
  
  public static <T> void assertEqualsEitherAndLog(String assertTitle, T obj, T one, T other,
      Boolean helper) {
    assertThat(assertTitle, obj, anyOf(equalTo(one), equalTo(other)));
    log.info(getLocation(helper) + assertTitle + LOG_SUFFIX);
  }
  
  public static <T> void assertEqualsAnyAndLog(String assertTitle, T obj, List<T> any,
      Boolean helper) {
    List<Matcher<? super T>> matchers = new ArrayList<Matcher<? super T>>();
    for (T a : any) {
      matchers.add(equalTo(a));
    }
    
    assertThat(assertTitle, obj, anyOf(matchers));
    log.info(getLocation(helper) + assertTitle + LOG_SUFFIX);
  }
  
  public static void assertUUIDEqualsAndLog(String assertTitle, UUID a, UUID b) {
    assertTrueAndLog(assertTitle, a.equals(b));
  }
  
  public static void assertStringEqualsAndLog(String assertTitle, String a, String b) {
    assertTrueAndLog(assertTitle, a.equals(b));
  }
  
  public static void assertZeroAndLog(String assertTitle, int size) {
    assertTrueAndLog(assertTitle, size == 0);
  }
  
  private static Boolean expOccurred = Boolean.FALSE;
  
  public static void expTestInit() {
    expOccurred = Boolean.FALSE;
  }
  
  public static void expTestOccurred(Exception e) {
    expOccurred = Boolean.TRUE;
    justLog(e.getMessage(), Boolean.TRUE);
  }
  
  public static void expTestAssert(String context) {
    assertTrueAndLog(context, expOccurred, Boolean.TRUE);
  }
  
  
}
