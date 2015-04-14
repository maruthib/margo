package com.acme.common;

public enum HttpMethod {
  GET("GET"),
  POST("POST"),
  PUT("PUT"),
  DELETE("DELETE"),
  HEAD("HEAD"),
  PATCH("PATCH");
  
  public static final String META = "meta";
  private final String name;

  private HttpMethod (String name) {
    this.name = name;
  }

  public String toString() {
    return (name);
  }
  
  public static HttpMethod fromString(String nameStr) {
    if (nameStr == null) {
      throw new IllegalArgumentException("No HttpMethod with name " + nameStr + " found");
    }
    
    for (HttpMethod type: HttpMethod.values()) {
      if (type.toString().equalsIgnoreCase(nameStr)) return type;
    }
    
    throw new IllegalArgumentException("No HttpMethod with name " + nameStr + " found");
  }
  
}