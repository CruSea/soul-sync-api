const io = require('socket.io-client');
const readline = require('readline');

const socket = io(
  'http://localhost:4000?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NDAxOGFmYi1lMTNkLTQyNzUtYWNkYy0xODM2Yzg0YTYxMTgiLCJlbWFpbCI6ImJpa2lsYS5rZXRlbWEtdWdAYWF1LmVkdS5ldCIsImltYWdlVXJsIjpudWxsLCJhY2NvdW50cyI6W10sImlhdCI6MTczNjg2MjkxMywiZXhwIjoxNzM2ODY2NTEzfQ.6e2VDdptkp54zfk-u9KD5HeTXntoEh_E-iwVQb9S1dg',
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
    socket.emit(
      'message',
      JSON.stringify({
        type: 'CHAT',
        metadata: {
          userId: process.env.DEFAULT_MENTOR_ID,
          email: 'bikila.ketema-ug@aau.edu.et',
          conversationId: 'f0d1df70-5798-4c40-81aa-03a011e15bd9',
        },
        payload: {
          channelId: '03609b84-8e20-426b-9de7-4f7bb65062bf',
          body: line,
          address: '5209941226',
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
