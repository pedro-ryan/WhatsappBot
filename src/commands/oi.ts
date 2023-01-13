import { generateCommand } from '../utils/commands';

generateCommand(
  {
    Command: (sock, command) => {
      return command.replyMessage('Olá');
    },
  },
  {
    toUse: 'oi',
    description: 'apenas responde com um Olá',
  },
);
