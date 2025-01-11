const io = require('socket.io-client');

const socket = io('http://localhost:3002', {
  auth: {
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYzdhZTBlMS1jZWNmLTQ1MmYtOTFjMy0yZjMwZTY4YzM2YTYiLCJlbWFpbCI6ImJubW1hcmtvc0BnbWFpbC5jb20iLCJpbWFnZVVybCI6bnVsbCwiYWNjb3VudHMiOltdLCJpYXQiOjE3MzY2MjM0NTMsImV4cCI6MTczNjYyNzA1M30.YT7fPro9IKTmHwRrYhWhXf1YZLBbNOO5W6cZnKDdXvo', 
  },
});

socket.on('connect', () => {
  console.log('Connected to the WebSocket server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from the WebSocket server');
});

socket.on('message', (message) => {
  console.log(`Received message: ${message}`);
});

socket.emit(
  'message',
  JSON.stringify({
    type: 'CHAT',
    metadata: {
      mentorId: '51eacba7-24b6-429f-9cd5-00d7bacacbb6',
      conversationId: '51eacba7-24b6-429f-9cd5-00d7bacacbb6',
    },
    payload: {
      text: 'Hello, server!',
    },
    socket: 'user1',
  }),
);

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
