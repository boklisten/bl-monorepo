export class BlapiResponse {
  documentName: string | undefined;
  data: unknown;

  constructor(data: unknown) {
    this.data = data;
  }
}
