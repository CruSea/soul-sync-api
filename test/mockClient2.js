const io = require('socket.io-client');
const readline = require('readline');
const socket = io(
  'http://localhost:3002?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNjIzZjE3MS0wOTU2LTQwMTEtODZlOC0xMTkyN2IyODhiNzEiLCJlbWFpbCI6ImJubW1hcmtvc0BnbWFpbC5jb20iLCJpbWFnZVVybCI6bnVsbCwiYWNjb3VudHMiOltdLCJpYXQiOjE3MzcxMTE3MTgsImV4cCI6MTczNzExNTMxOH0.gwPg5onc2y8KLz-Vh8EpGVlpnFImJQW-U-Oz3apSTm8',
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
    socket.send(
      JSON.stringify({
        type: 'CHAT',
        metadata: {
          userId: process.env.DEFAULT_MENTOR_ID,
          email: 'bnmmarkos@gmail.com',
          conversationId: 'b2c2c530-e1e9-48ef-a7c6-e4fdf7ed1361',
        },
        payload: {
          channelId: '0ef07de8-24a5-4de3-99d9-17a85215b9df',
          body: line,
          address: 'whatsapp:+251973983018',
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
