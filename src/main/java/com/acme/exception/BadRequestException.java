package com.acme.exception;

import com.acme.exception.AbstractException;

public class BadRequestException extends AbstractException {
  public BadRequestException() {
    super();
  }

  public BadRequestException(String err) {
    super(err);
  }

  public BadRequestException(Throwable t) {
    super(t);
  }

  public BadRequestException(String err, Throwable t) {
    super(err, t);
  }
}
