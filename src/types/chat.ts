export interface Chat {
  type: 'CHAT' | 'MESSAGE';
  metadata: any;
  payload: any;
}
