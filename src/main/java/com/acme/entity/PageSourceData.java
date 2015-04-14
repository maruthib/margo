package com.acme.entity;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

public final class PageSourceData {
  private String id;
  private String source;
  private List<TagDistribution> tagDistribution;
  
  public static class MetaParam {
    public static final String URL = "url";
  }
  
  public PageSourceData(String id, String source, Map<String, AtomicInteger> tagDistribution) {
    this.id = id;
    this.source = source;
  
    this.tagDistribution = new ArrayList<TagDistribution>();
    for (Map.Entry<String, AtomicInteger> e : tagDistribution.entrySet()) {
      this.tagDistribution.add(new TagDistribution(e.getKey(), e.getValue().get()));      
    }

    Collections.sort(this.tagDistribution);
  }
  
  public String getId() {
    return id;
  }
  
  public String getSource() {
    return source;
  }
  
  public List<TagDistribution> getTagDistribution() {
    return tagDistribution;
  }
  
  public class TagDistribution implements Comparable<TagDistribution> {
    private String tag;
    private Integer count;
    
    public TagDistribution(String tag, Integer count) {
      this.tag = tag;
      this.count = count;
    }
    
    public String getTag() {
      return tag;
    }
    
    public Integer getCount() {
      return count;
    }
    
    public int compareTo(TagDistribution o) {
      return o.getCount() - this.count;
    }
  }

}
