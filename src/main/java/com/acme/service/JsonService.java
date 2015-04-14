package com.acme.service;

import java.lang.reflect.Type;

public interface JsonService {
  public String toJson(Object obj);
  
  public String toJson(Object obj, Type classType);

  public <T> T fromJson(byte[] json, Class<T> clazz);
  
  public <T> T fromJson(byte[] json, Type classType);
  
  public <T> T fromJson(String json, Class<T> clazz);
  
  public <T> T fromJson(String json, Type classType);
  
  public Object naturalFromJson(String json);  

}
