export interface MessageStrategy {
  processMessage(id: string, message: any): Promise<string>;
}
