export interface NegaritChat {
  id: string;
  type: string;
  metadata: {
    type: string;
    channelId: string;
  };
  payload: {
    id: number;
    sms_port_id: number;
    gateway_id: number;
    message_id: string;
    message: string;
    sent_from: string;
    sender_name: string | null;
    received_date: string;
    created_at: {
      date: string;
      timezone_type: number;
      timezone: string;
    };
  };
}