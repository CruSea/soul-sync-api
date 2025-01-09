// client.js
const io = require('socket.io-client');

// Set the WebSocket server URL
const socket = io(`http://localhost:${process.env.CHAT_PORT}`, {
  // Set the authorization token
  auth: {
    token: 'your_token_here', // Replace with your actual token
  },
});

// Set up event listeners
socket.on('connect', () => {
  console.log('Connected to the WebSocket server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from the WebSocket server');
});

socket.on('message', (message) => {
  console.log(`Received message: ${message}`);
});

// Send a message to the server
socket.emit(
  'message',
  JSON.stringify({
    type: 'CHAT',
    message: 'Hello, server!',
    senderId: 'user1',
    receiverId: 'user2',
  }),
);

// Handle errors
socket.on('error', (error) => {
  console.error('Error occurred:', error);
});

// Handle reconnect attempts
socket.on('reconnect_attempt', () => {
  console.log('Reconnecting to the WebSocket server...');
});

// Handle reconnect errors
socket.on('reconnect_error', (error) => {
  console.error('Reconnection error:', error);
});

// Handle reconnect failures
socket.on('reconnect_failed', () => {
  console.log('Reconnection failed');
});
