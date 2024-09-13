class Validate {
  public IsEmail(s: string) {
    return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(s);
  }
}

export default new Validate();
