export default interface IStrategy {
  supports(type: string): Promise<boolean>;
  formatMessage(message: any): Promise<any>;
}
