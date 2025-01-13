const io = require('socket.io-client');
const readline = require('readline');

const socket = io(
  'http://localhost:3002?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkN2NmZTQwZC05Yzg0LTRiNmUtOWUwNS04M2YzOTE2YjQ4MTIiLCJlbWFpbCI6ImJubW1hcmtvc0BnbWFpbC5jb20iLCJpbWFnZVVybCI6bnVsbCwiYWNjb3VudHMiOltdLCJpYXQiOjE3MzY3Mjc0OTksImV4cCI6MTczNjczMTA5OX0.u1ZyknkQvrNjhLFCmiw91x3LukXxrlv1zBEviQqv3IQ',
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
          email: 'bnnmmarkos@gmail.com',
          conversationId: process.env.DEFAULT_CONVERSATION_ID,
        },
        payload: {
          channelId: 'b0320efb-9e5f-4d22-9cbc-e11030b47359',
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
