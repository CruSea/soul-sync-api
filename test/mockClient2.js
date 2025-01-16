const io = require('socket.io-client');
const readline = require('readline');
const socket = io(
  'http://localhost:3002?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZmQzMGM5MS1mOWIxLTQyMGEtOTdhMy1lNTYyNzEyOWZmY2UiLCJlbWFpbCI6ImplcnVzYWxlbWdpcm1hNDIxQGdtYWlsLmNvbSIsImltYWdlVXJsIjpudWxsLCJhY2NvdW50cyI6W10sImlhdCI6MTczNzAyNDA4NiwiZXhwIjoxNzM3MDI3Njg2fQ.pvWh4eqB2wTx7r348TPRd1W3rY19qxZrBQdY8e_RH_g',
);
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

socket.on('connect', () => {
  console.log('Connected to the WebSocket server');
  rl.setPrompt('Message: ');
  rl.prompt();
});

socket.on('disconnect', () => {
  console.log('Disconnected from the WebSocket server');
});

socket.on('message', (message) => {
  const data = JSON.parse(message);
  console.log('Received message: ', data.payload.message.body);
  rl.prompt();
});

rl.on('line', (line) => {
  if (line.trim() !== '') {
    // Send a mock payload to the "Twilio WebSocket Server"
    socket.send(
      JSON.stringify({
        type: 'CHAT',
        metadata: {
          userId: process.env.DEFAULT_MENTOR_ID,
          email: 'jerusalemgirma421@gmail.com',
          conversationId: 'e2d6ed64-8b26-4db0-93d9-1ebe0ff20007',
        },
        payload: {
          channelId: 'afc2c786-3997-4d2f-bf9f-bbe9b2ff9e9e',
          body: line,
          address: '+251966830049', // Example Twilio Sandbox/recipient WhatsApp number
          type: 'SENT',
        },
        socket: 'user1',
      }),
    );
  }
  rl.prompt();
});

socket.on('error', (error) => {
  console.error('Error occurred:', error);
});

socket.on('reconnect_attempt', () => {
  console.log('Reconnecting to the WebSocket server...');
});

socket.on('reconnect_error', (error) => {
  console.error('Reconnection error:', error);
});

socket.on('reconnect_failed', () => {
  console.log('Reconnection failed');
});
