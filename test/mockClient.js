const io = require('socket.io-client');
const readline = require('readline');

const socket = io(
  'http://localhost:3002?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0OTM2MzY2Yi01ODk3LTRjYzYtYjA4NC1iZTBhYTRiODU5OTQiLCJlbWFpbCI6ImJubW1hcmtvc0BnbWFpbC5jb20iLCJpbWFnZVVybCI6bnVsbCwiYWNjb3VudHMiOltdLCJpYXQiOjE3MzY3NTU5MDUsImV4cCI6MTczNjc1OTUwNX0.xl0STWfPfbZt1dHl3je0XZxip-sd7lcOK4TXy7yTVnM',
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
          conversationId: '84a72230-b792-49a3-a0c8-2426bbafd8a9',
        },
        payload: {
          channelId: 'e73e88bb-cc40-4d65-8c62-0559951b594c',
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
