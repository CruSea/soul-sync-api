const io = require('socket.io-client');
const readline = require('readline');

const socket = io(
  'http://localhost:3002?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwOGVlZTdhNC04MDIyLTRmZDgtODJlOC1hMjA5NTQzYzY3ZjMiLCJlbWFpbCI6ImplcmloYWdiakBnbWFpbC5jb20iLCJpbWFnZVVybCI6bnVsbCwiYWNjb3VudHMiOltdLCJpYXQiOjE3Mzc1NTA2OTYsImV4cCI6MTczNzU1NDI5Nn0.sO-G1Rb6uDiM9RZV2yQFMaXNl1NTluel_U-ROX6biX8',
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
          email: 'jerihagbj@gmail.com',
          conversationId: '6656c4b3-c32b-4d3f-8809-f06e151af749',
        },
        payload: {
          channelId: '1e9d57f8-0d2c-4b7b-bc8d-a964b5d3f38a',
          body: line,
          address: '411270067',
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
