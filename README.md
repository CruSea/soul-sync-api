## Description

[LeyuChat](https://dev.leyuchat.com/) A Message Automation tool

## Installation

```bash
$ npm install
```

## Running Mini App

```bash
# development
$ npm run start

# run database consumer
$ pm2 start dist/src/apps/consumers/database-consumer/main.js --no-daemon

# run chat consumer
$ pm2 start dist/src/apps/consumers/chat-consumer/main.js --no-daemon
```

## License

LeyuChat is [MIT licensed](LICENSE).
