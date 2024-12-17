export class BlapiResponse {
  documentName: string;
  data: any[];

  constructor(data: any[]) {
    this.data = data;
  }
}
