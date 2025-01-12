const io = require('socket.io-client');
const readline = require('readline');

const socket = io('http://localhost:3002', {
  auth: {
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYzdhZTBlMS1jZWNmLTQ1MmYtOTFjMy0yZjMwZTY4YzM2YTYiLCJlbWFpbCI6ImJubW1hcmtvc0BnbWFpbC5jb20iLCJpbWFnZVVybCI6bnVsbCwiYWNjb3VudHMiOltdLCJpYXQiOjE3MzY2NDI1NTAsImV4cCI6MTczNjY0NjE1MH0.170OivapDl99tv3TTpMc40M-nF1Jwlzhseo0bDJq_SY',
  },
});

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
          userId: '51eacba7-24b6-429f-9cd5-00d7bacacbb6',
          email: 'bnnmmarkos@gmail.com',
          conversationId: 'd3a64e77-91cb-42db-a82a-d8ec5eb48adc',
        },
        payload: {
          channelId: '118cb2b2-cbfa-4a3d-808c-485634155f83',
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
