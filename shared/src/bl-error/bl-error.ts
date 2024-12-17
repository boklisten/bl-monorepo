export class BlError extends Error {
  private _code: number;
  private _className: string;
  private _methodName: string;
  private _errorStack: BlError[];
  private _data: any;
  private _store: { key: string; value: any }[];

  constructor(msg: string) {
    super(msg);
    this._errorStack = [];
    this._store = [];
    this._code = 0;
  }

  add(blError: BlError): BlError {
    this._errorStack.push(blError);
    return this;
  }

  store(key: string, value: any) {
    this._store.push({ key: key, value: value });
    return this;
  }

  getStore(): { key: string; value: any }[] {
    return this._store;
  }

  data(data: any): BlError {
    this.data = data;
    return this;
  }

  getData(): any {
    return this._data;
  }

  get errorStack(): BlError[] {
    return this._errorStack;
  }

  className(className: string): BlError {
    this._className = className;
    return this;
  }

  getClassName(): string {
    return this._className;
  }

  methodName(methodName: string): BlError {
    this._methodName = methodName;
    return this;
  }

  getMethodName(): string {
    return this._methodName;
  }

  msg(msg: string): BlError {
    this.message = msg;
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
      for (let err of blError.errorStack) {
        this.printErrorStack(err);
      }
    }
  }
}
