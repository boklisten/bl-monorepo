export class BlError extends Error {
  private _code: number;
  private _className: string | undefined;
  private _methodName: string | undefined;
  private _errorStack: BlError[];
  private _data: unknown;
  private _store: { key: string; value: unknown }[];

  constructor(message: string) {
    super(message);
    this._errorStack = [];
    this._store = [];
    this._code = 0;
  }

  add(blError: BlError): BlError {
    this._errorStack.push(blError);
    return this;
  }

  store(key: string, value: unknown) {
    this._store.push({ key: key, value: value });
    return this;
  }

  getStore(): { key: string; value: unknown }[] {
    return this._store;
  }

  data(data: unknown): BlError {
    // @ts-expect-error fixme: auto ignored  bad typing
    this.data = data;
    return this;
  }

  getData() {
    return this._data;
  }

  get errorStack(): BlError[] {
    return this._errorStack;
  }

  className(className: string): BlError {
    this._className = className;
    return this;
  }

  getClassName(): string | undefined {
    return this._className;
  }

  methodName(methodName: string): BlError {
    this._methodName = methodName;
    return this;
  }

  getMethodName(): string | undefined {
    return this._methodName;
  }

  msg(message: string): BlError {
    this.message = message;
    return this;
  }

  getMsg(): string {
    return this.message;
  }

  code(code: number) {
    this._code = code;
    return this;
  }

  getCode(): number {
    if (!this._code) return 0;
    return this._code;
  }

  public printStack() {
    console.log("");
    console.log("BlError stack:");
    this.printErrorStack(this);
    console.log("");
  }

  private printErrorStack(blError: BlError) {
    console.log("\t>BlError[" + blError.getCode() + "]: " + blError.getMsg());

    if (blError.errorStack && blError.errorStack.length > 0) {
      for (const error of blError.errorStack) {
        this.printErrorStack(error);
      }
    }
  }
}
