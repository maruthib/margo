package com.acme.service;

import java.lang.reflect.Type;

import com.google.gson.*;
import com.acme.service.NaturalDeserializer;
import com.acme.service.JsonService;

public class GsonJsonServiceImpl implements JsonService {
  public final static GsonJsonServiceImpl I = new GsonJsonServiceImpl();
  
  private Gson gson;
  private GsonBuilder gsonBuilder;
  private Gson gsonNatural;


  public GsonJsonServiceImpl() {
    gson = new Gson();

    gsonBuilder  = new GsonBuilder();
    gsonBuilder.registerTypeAdapter(Object.class, new NaturalDeserializer());
    gsonNatural = gsonBuilder.create();    
  }
  
  public String toJson(Object obj) {
    return (gson.toJson(obj));
  }
  
  public String toJson(Object obj, Type classType) {
    return (gson.toJson(obj, classType));
  }
  
  public <T> T fromJson(String json, Class<T> clazz) {
    return (gson.fromJson(json, clazz));
  }
  
  public <T> T fromJson(String json, Type classType) {
    return (gson.fromJson(json, classType));
  }
  
  public <T> T fromJson(byte[] json, Class<T> clazz) {
    return (gson.fromJson(new String(json), clazz));
  }
  
  public <T> T fromJson(byte[] json, Type classType) {
    return (gson.fromJson(new String(json), classType));
  }
  
  public Object naturalFromJson(String json) {
    return gsonNatural.fromJson(json, Object.class);
  }

}
