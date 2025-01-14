const io = require('socket.io-client');
const readline = require('readline');

const socket = io(
  'http://localhost:4000?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NDAxOGFmYi1lMTNkLTQyNzUtYWNkYy0xODM2Yzg0YTYxMTgiLCJlbWFpbCI6ImJpa2lsYS5rZXRlbWEtdWdAYWF1LmVkdS5ldCIsImltYWdlVXJsIjpudWxsLCJhY2NvdW50cyI6W10sImlhdCI6MTczNjg1ODYyMSwiZXhwIjoxNzM2ODYyMjIxfQ.FPpWU7sLKbPxjqqxV4AoUzhGKq86yq09s4TsXNK3JO8',
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
          conversationId: '96a29df8-834b-4c9c-912a-e317e7a6debb',
        },
        payload: {
          channelId: '24723624-b7b3-4f6d-b057-e51d4fa65635',
          body: line,
          address: '0973983018',
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
