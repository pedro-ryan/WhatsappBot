import { WASocket } from '@adiwajshing/baileys';
import { Command } from '../interfaces';

export default function oi(sock: WASocket, command: Command) {
  return command.replyMessage('Olá');
}
