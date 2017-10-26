function getCloudinaryInstanceOf(Klass, obj) {
  if (obj instanceof Klass) {
    return obj;
  } else {
    return new Klass(obj);
  }
}

export { getCloudinaryInstanceOf };
