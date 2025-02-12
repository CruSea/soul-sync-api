export default interface Strategy {
  supports(type: string): Promise<boolean>;
  formatMessage(message: any): Promise<any>;
}
