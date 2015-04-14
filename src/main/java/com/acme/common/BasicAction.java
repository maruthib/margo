package com.acme.common;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

import com.acme.service.JsonService;
import com.acme.service.GsonJsonServiceImpl;

import com.acme.common.CompoundResult;

public abstract class BasicAction {
  private JsonService jsonSvc = GsonJsonServiceImpl.I;
  
  private InputStream inputStream;
  protected transient boolean initialized = false;

  protected String prepCRStream(CompoundResult result) {
    this.inputStream = new ByteArrayInputStream(result.toJson().getBytes());
    return ActionResult.Generic.STREAM;
  }
  
  protected String prepCRStream() {
    return prepCRStream((new CompoundResult()).setSuccess());
  }
  
  protected String prepInputStream(Object data) {
    this.inputStream = new ByteArrayInputStream(jsonSvc.toJson(data).getBytes());
    return ActionResult.Generic.STREAM;    
  }
  
  protected String prepOctetInputStream(InputStream ioStream) {
    this.inputStream = ioStream;
    return ActionResult.Generic.OCTET_STREAM;
  }
  
  protected void setInputStream(InputStream ioStream) {
    this.inputStream = ioStream;
  }
  
  public InputStream getInputStream() {
    if (this.inputStream == null) {
      this.inputStream = new ByteArrayInputStream(jsonSvc.toJson(new Object()).getBytes());
    }
    
    return this.inputStream;
  }
  
}
