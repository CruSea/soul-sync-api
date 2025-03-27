export interface MessageStrategy {
  processMessage(id: string, message: any): Promise<string>;
  formatMessage(id: string, message: any): any;
}
