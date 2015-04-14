package com.acme.exception;

import com.acme.exception.AbstractException;

public class InternalServerException extends AbstractException {

  private static final long serialVersionUID = 1L;

  public InternalServerException() {
    super();
  }

  public InternalServerException(String err) {
    super(err);
  }

  public InternalServerException(Throwable t) {
    super(t);
  }

  public InternalServerException(String err, Throwable t) {
    super(err, t);
  }
}
