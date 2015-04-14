package com.acme.common;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;

public class ServletUtil {
  public static final String REGEX_SLASH = "/";
  
  public static StringBuffer readContent(HttpServletRequest request) throws IOException {
    StringBuffer buffer = new StringBuffer();    

    ServletInputStream inStr = request.getInputStream();
    int d;
    while((d = inStr.read()) != -1){
      buffer.append((char)d);
    }    
    
    return buffer;
  }
  
  public static List<String> getUrlSegments(HttpServletRequest request) {
    String uri = request.getRequestURI();

    Pattern urlSegmentsPattern  = Pattern.compile(REGEX_SLASH);    
    Matcher m = urlSegmentsPattern.matcher(uri);

    List<String> urlSegments = new ArrayList<String>();
    for (int i = 0; i < m.groupCount(); i++) {
      urlSegments.add(m.group(i));
    }
    
    return urlSegments;
  }
  
  public static <T> T getRequestParam(Map<String, Object> request, String paramName,
      Class<T> retType, Boolean optional) {
    if (request == null) {
      if (!optional) {
        throw new RuntimeException("request map null");        
      }
      
      return null;
    }
    
    T paramVal = retType.cast(request.get(paramName));
    if (paramVal == null && !optional) { 
      throw new RuntimeException(paramName + " missing in request");
    }
    
    return paramVal;
  }
  
  public static <T> T getRequestParam(Map<String, Object> request, String paramName,
      Class<T> retType) {
    return getRequestParam(request, paramName, retType, Boolean.FALSE);
  }
  
  public static String getRequestParam(Map<String, Object> request, String paramName) {
    return getRequestParam(request, paramName, String.class, Boolean.FALSE);
  }
  
  public static String getRequestParam(Map<String, Object> request, String paramName,
      Boolean optional) {
    return getRequestParam(request, paramName, String.class, optional);    
  }

  public static Integer getRequestIntParam(Map<String, Object> request, String paramName,
      Boolean optional) {
    String paramVal = getRequestParam(request, paramName, String.class, optional);
    
    if (paramVal == null) return null;
    
    return Integer.parseInt(paramVal);    
  }

  public static Integer getRequestIntParam(Map<String, Object> request, String paramName) {
    return getRequestIntParam(request, paramName, Boolean.FALSE);
  }
  
  public static Double getRequestDoubleParam(Map<String, Object> request, String paramName,
      Boolean optional) {
    return getRequestParam(request, paramName, Double.class, optional);    
  }

  public static Double getRequestDoubleParam(Map<String, Object> request, String paramName) {
    return getRequestDoubleParam(request, paramName, Boolean.FALSE);
  }
  
  public static UUID getRequestUUIDParam(Map<String, Object> request, String paramName,
      Boolean optional) {
    String UUIDStr = getRequestParam(request, paramName, String.class, optional);
    if (UUIDStr == null) return null;
    
    return UUID.fromString(UUIDStr);
  }
  
  public static UUID getRequestUUIDParam(Map<String, Object> request, String paramName) {
    return getRequestUUIDParam(request, paramName, Boolean.FALSE);
  }
  
  public static String getRequestParamMapAsString(Map<String, Object> request, String paramName) {
    return request.get(paramName).toString();
  }
  
}