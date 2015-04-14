package com.acme.exception;

public abstract class AbstractException extends RuntimeException {
  public AbstractException()
  {
    super();
  }

  public AbstractException(String err)
  {
    super(err);
  }

  public AbstractException(Throwable t)
  {
    super(t);
  }

  public AbstractException(String err, Throwable t)
  {
    super(err, t);
  }
}
