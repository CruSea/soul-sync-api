export interface TwilioChat {
  id: string;
  type: string;
  metadata: {
    type: string;
    channelId: string;
  };
  payload: {
    to: string;
    body: string;
    from: string;
    dateCreated: string;
  };
}
