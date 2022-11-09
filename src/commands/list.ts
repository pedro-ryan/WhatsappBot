import { WASocket } from '@adiwajshing/baileys';
import { Command, RawCommand, Replys, SubCommands } from '../interfaces';
import { makeCenter, monospace } from '../utils';

function SendList(sock: WASocket, command: RawCommand) {
  sock.sendMessage(command.id, {
    buttons: [
      {
        buttonId: 'list add',
        buttonText: { displayText: 'Quero Participar' },
      },
      {
        buttonId: 'list remove',
        buttonText: { displayText: 'Retirar meu nome' },
      },
    ],
    footer: 'apenas um teste, para ver a formatação',
    text: monospace(
      [
        makeCenter('', '-'),
        makeCenter('LISTA DE TESTE'),
        makeCenter('', '-'),
        ...testList.map(({ name }, index) => {
          const listNumber = (index + 1).toString().padStart(2, '0');
          return makeCenter(`${listNumber}-${name}`);
        }),
        makeCenter('', '-'),
      ].join('\r\n'),
    ),
  });
}

const testList: Array<{ id: string; name: string }> = [];

const subCommands: SubCommands = {
  rename(sock, command) {
    if (!command.subArgs[0]) {
      return command.sendText(
        'Comando invalido, use: !list rename <novo nome>',
      );
    }
    const index = testList.findIndex(({ id }) => id === command.participant);
    if (index === -1) {
      return command.sendText('Você não está nessa lista :D');
    }
    testList.splice(index, 1, {
      id: command.participant,
      name: command.subArgs.join(' '),
    });
    SendList(sock, command);
  },
};

const replys: Replys = {
  add(sock, command, index) {
    if (index < 0) {
      testList.push({
        id: command.participant,
        name: command.raw.pushName as string,
      });
      SendList(sock, command);
    } else {
      const inListNumber = (index + 1).toString().padStart(2, '0');
      command.sendText(
        `Você já foi adicionado na lista, verifique o numero ${inListNumber} na lista, caso queira mudar seu nome use: !list rename <novo nome>`,
      );
    }
  },
  remove(sock, command, index) {
    if (index > -1) {
      testList.splice(index, 1);
      SendList(sock, command);
    } else {
      command.sendText('Você não está nessa lista :D');
    }
  },
};

export default function list(sock: WASocket, command: Command) {
  if (command.isButtonReply) {
    console.log(command.buttonReply);
    const replyCommand = replys[command.buttonReply.args[0]];
    const index = testList.findIndex(({ id }) => id === command.participant);
    if (replyCommand) return replyCommand(sock, command, index);

    return command.sendText(
      'Algo errado, hmm acho que esse botão ainda não foi implementado desculpe 😔',
    );
  }
  if (command.subCommand) {
    console.log(command.subCommand);
    const subCommand = subCommands[command.subCommand];
    if (subCommand) return subCommand(sock, command);

    return command.sendText('Infelizmente esse comando não existe');
  }
  SendList(sock, command);
}
