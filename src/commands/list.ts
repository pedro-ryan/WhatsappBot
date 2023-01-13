import { proto, WASocket } from '@adiwajshing/baileys';
import { scheduledJobs, scheduleJob } from 'node-schedule';
import { Command, RawCommand, Replys, SubCommands } from '../utils/interfaces';
import { bold, makeCenter, monospace } from '../utils/text';

const List = {
  participants: [] as Array<{ id: string; name: string }>,
  closed: false,
  banned: [{ id: '', reason: '' }],
  lifetime: new Date(new Date().getTime() + (1 * 60000) / 2),
  creator: { id: '559192224332@s.whatsapp.net', name: 'Pedro Ryan' },
  group: ['120363030947374398@g.us', '120363023151278511@g.us'],
  title: 'Lista de Teste',
  description: 'Lista Principal do Grupo',
  config: {
    limit: 2,
    shuffle: true,
    teamLengths: 1,
    reserveLengths: 2,
    divider: '-',
  },
  footer: {
    createdBy: false,
    timeToClose: true,
  },
};

const Lists = [List];

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
    footer: bold(
      `A lista será fechada automaticamente\nas ${List.lifetime.toLocaleTimeString(
        'pt-BR',
      )} do dia ${List.lifetime.toLocaleDateString('pt-BR')}`,
    ),
    text: monospace(
      [
        makeCenter('', List.config.divider),
        makeCenter(List.title),
        makeCenter('', List.config.divider),
        ...List.participants.map(({ name }, index) => {
          const listNumber = (index + 1).toString().padStart(2, '0');
          return makeCenter(`${listNumber}-${name}`);
        }),
        makeCenter('', List.config.divider),
      ].join('\r\n'),
    ),
  });
}

const subCommands: SubCommands = {
  rename(sock, command) {
    if (!command.subArgs[0]) {
      return command.sendText(
        'Comando invalido, use: !list rename <novo nome>',
      );
    }
    const index = List.participants.findIndex(
      ({ id }) => id === command.participant,
    );
    if (index === -1) {
      return command.sendText('Você não está nessa lista :D');
    }
    List.participants.splice(index, 1, {
      id: command.participant,
      name: command.subArgs.join(' '),
    });
    SendList(sock, command);
  },
  list(sock, command) {
    const sections = [
      {
        title: 'Listas Ativas',
        rows: Lists.filter((e) => !e.closed).map((v) => ({
          title: v.title,
          rowId: v.title,
          description: v.description,
        })),
      },
      {
        title: 'Listas Completas',
        rows: Lists.filter((e) => e.closed).map((v) => ({
          title: v.title,
          rowId: v.title,
          description: v.description,
        })),
      },
    ] as proto.Message.ListMessage.ISection[];

    sock.sendMessage(command.id, {
      title: 'Listagem das Listas do Grupo atual',
      text: [
        monospace('Atualmente esse grupo tem 1 lista ativa'),
        monospace('Selecione uma lista abaixo para poder ter acesso a ela'),
      ].join('\r\n'),
      buttonText: 'Ver Listas',
      sections,
    });
  },
};

const replys: Replys = {
  add(sock, command, index) {
    if (new Date().getTime() > List.lifetime.getTime()) {
      return sock.sendMessage(command.id, {
        text: 'Infelizmente a lista já foi fechada 😔',
      });
    }
    if (index < 0) {
      List.participants.push({
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
      List.participants.splice(index, 1);
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
    const index = List.participants.findIndex(
      ({ id }) => id === command.participant,
    );
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
  if (!scheduledJobs[List.title]) {
    scheduleJob(List.title, List.lifetime, () => {
      if (!List.closed) {
        List.closed = true;
        sock.sendMessage(command.id, {
          text: `A lista *${List.title}*, foi fechada`,
        });
      }
      if (List.config.shuffle) {
        sock.sendMessage(command.id, {
          text: `Iniciando sorteio dos Times ( implementar dps :p )`,
        });
      }
    });
  }
}
