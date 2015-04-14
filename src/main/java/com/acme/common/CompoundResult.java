package com.acme.common;

import java.util.Map;
import java.util.HashMap;
import com.google.gson.*;

public class CompoundResult {
  private Map<CompoundResultKey, Object> result;

  public CompoundResult() {
    result = new HashMap<CompoundResultKey, Object>();
  }

  public CompoundResult(CompoundResultKey key, Object val) {
    result = new HashMap<CompoundResultKey, Object>();
    result.put(key, val);
  }

  public CompoundResult setFailure() {
    result.put(CompoundResultKey.result, ResultVal.failure);
    return (this);
  }

  public CompoundResult setFailure(String metadata) {
    return (setFailure().setMetadata(metadata));
  }

  public CompoundResult setSuccess() {
    result.put(CompoundResultKey.result, ResultVal.success);
    return (this);
  }

  public CompoundResult setSuccess(String metadata) {
    return (setSuccess().setMetadata(metadata));
  }

  public CompoundResult setInform() {
    result.put(CompoundResultKey.result, ResultVal.inform);
    return (this);
  }

  public CompoundResult setInform(String metadata) {
    return (setInform().setMetadata(metadata));
  }
  
  public CompoundResult setMore() {
    result.put(CompoundResultKey.result, ResultVal.more);
    return (this);
  }

  public CompoundResult setMore(String metadata) {
    return (setMore().setMetadata(metadata));
  }

  public CompoundResult setRedirect() {
    result.put(CompoundResultKey.result, ResultVal.redirect);
    return (this);
  }

  public CompoundResult setRedirect(String metadata) {
    return (setRedirect().setMetadata(metadata));
  }

  public CompoundResult setUnauthen() {
    result.put(CompoundResultKey.result, ResultVal.unauthen);
    return (this);
  }

  public CompoundResult setUnauthen(String metadata) {
    return (setUnauthen().setMetadata(metadata));
  }
  
  public Boolean isSuccess() {
    return (result.get(CompoundResultKey.result).toString().equals(ResultVal.success.toString()));
  }
  
  public Boolean isRedirect() {
    return (result.get(CompoundResultKey.result).toString().equals(ResultVal.redirect));    
  }
  
  public Boolean hasMetadata() {
    return (getMetadata() != null);
  }

  public CompoundResult put(CompoundResultKey key, Object val) {
    result.put(key, val);
    return (this);
  }

  public Object get(CompoundResultKey key) {
    return (result.get(key));
  }

  public CompoundResult setMetadata(String metadata) {
    result.put(CompoundResultKey.md, metadata);
    return (this);
  }
  
  public CompoundResult setResult(String resultVal) {
    result.put(CompoundResultKey.result, resultVal);
    return (this);
  }

  public String getMetadata() {
    return ((String) result.get(CompoundResultKey.md));
  }

  public String toJson() {
    Gson gson = new Gson();
    return (gson.toJson(result));
  }

  public CompoundResult copyResult(CompoundResult from) {
    result.put(CompoundResultKey.result, from.get(CompoundResultKey.result));
    return (this);
  }

  public CompoundResult copyAVPair(CompoundResult from, CompoundResultKey key) {
    put(key, from.get(key));
    return (this);
  }
  
  public ResultVal getResult() {
    return (ResultVal) result.get(CompoundResultKey.result);
  }
  
  public static CompoundResult successCR() {
    return (new CompoundResult()).setSuccess();
  }

  public static CompoundResult failureCR() {
    return (new CompoundResult().setFailure());
  }
  
  public static enum ResultVal {
    success,
    failure,
    unauthen,
    inform,
    more,
    redirect
  }

}
