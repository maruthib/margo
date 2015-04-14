package com.acme.common;

public class Pair<N, V> {
  private final N name;
  private final V value;
  
  public Pair(N name, V value) {
    this.name = name;
    this.value = value;
  }
  
  public N getName() {
    return name;
  }
  
  public V getValue() {
    return value;
  }
  
  public N getFirst() {
    return getName();
  }
  
  public V getSecond() {
    return getValue();
  }
  
}
