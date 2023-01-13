import { proto, WASocket } from '@adiwajshing/baileys';
import Commands from '../commands';
import {
  buttonResponse,
  Command,
  CommandThis,
  ExecConfig,
  FailContext,
  GenConfig,
  GenInfos,
  MakeCommand,
  MakeMessageFuncs,
  RawCommand,
} from './interfaces';

const makeMessageFuncs: MakeMessageFuncs = (command, sock) => {
  return {
    sendText(text, more) {
      return sock.sendMessage(command.id, {
        text,
        ...more,
      });
    },
    replyMessage(text, more) {
      return sock.sendMessage(
        command.id,
        {
          text,
          ...more,
        },
        { quoted: command.raw },
      );
    },
  };
};

const buttonAtributes = (message: proto.IWebMessageInfo) => {
  const isButtonReply =
    !!message.message?.buttonsResponseMessage ||
    !!message.message?.templateButtonReplyMessage;

  const buttonResponse = {
    ...message.message?.buttonsResponseMessage,
    ...message.message?.templateButtonReplyMessage,
  } as buttonResponse;

  const id =
    buttonResponse?.selectedId || buttonResponse?.selectedButtonId || '';
  const buttonSplitted = id.split(' ');

  return {
    isButtonReply,
    buttonReply: {
      raw: buttonResponse,
      index: buttonResponse?.selectedIndex,
      id,
      text: buttonResponse?.selectedDisplayText,
      type: buttonResponse?.type,
      command: buttonSplitted?.splice(0, 1)[0],
      args: buttonSplitted,
    },
  };
};

const listAtributes = (message: proto.IWebMessageInfo) => {
  const isListReply = !!message.message?.listResponseMessage;
  const listResponse = message.message?.listResponseMessage;
  const id = listResponse?.singleSelectReply?.selectedRowId || '';

  const rawListCommand = id?.split(' ');

  return {
    isListReply,
    listReply: {
      id,
      raw: listResponse,
      title: listResponse?.title,
      description: listResponse?.description,
      command: rawListCommand.splice(0, 1)[0],
      args: rawListCommand,
    },
  };
};

const makeCommand: MakeCommand = (message, sock) => {
  const isReply = !!message.message?.extendedTextMessage;
  console.log(message.message);
  const result: RawCommand = {
    ...listAtributes(message),
    ...buttonAtributes(message),
    isReply,
    isCommand: false, // command !== '',
    command: '',
    subCommand: '',
    subArgs: [],
    args: [],
    raw: message,
    id: message.key.remoteJid as string,
    isMe: message.key.fromMe,
    isGroup: message.key.remoteJid?.includes('@g.us'),
    participant:
      (message.key.participant as string) || (message.key.id as string),
    textMessage:
      (isReply
        ? message.message?.extendedTextMessage?.text
        : message.message?.conversation) || '',
  };
  result.command = result?.buttonReply.command || '';

  const splitted = result.textMessage
    .split(' ')
    .filter((v) => v && !v.includes('\n'));

  const getValue = () => splitted.splice(0, 1)[0];
  const getArgValues = () => {
    const nextArgIndex = splitted.findIndex((v) => v.startsWith('-'));
    const end = nextArgIndex > -1 ? nextArgIndex : splitted.length;
    const values = splitted.splice(0, end);
    if (values.length === 0) values.push('true');
    return values;
  };

  while (splitted.length > 0) {
    const actual = getValue();
    const firstChar = actual[0];

    if (firstChar === '!' && result.textMessage.trim().startsWith(actual)) {
      result.command = actual.slice(1);
      if (!splitted[0]?.startsWith('-')) {
        result.subCommand = getValue();
        result.subArgs = getArgValues();
      }
    } else if (firstChar === '-') {
      result.args.push({
        arg: actual.replaceAll('-', ''),
        values: getArgValues(),
      });
    }
  }

  result.isCommand = result.command !== '';

  return {
    ...result,
    ...makeMessageFuncs(result, sock),
  };
};

const defaultMsgs = {
  notImplemented:
    'Algo errado, hmm acho que esse botão ainda não foi implementado desculpe 😔',
  notExist: 'Infelizmente esse comando não existe',
};

function ExecCommand(
  this: CommandThis,
  { CheckType, commands, index = '', onFail = () => {} }: ExecConfig,
) {
  const Fail = (ctx: FailContext) => {
    onFail(ctx);
    return true;
  };
  if (CheckType) {
    if (!commands) return Fail('NoCommand');
    const FnCommand = commands[index];
    if (FnCommand) {
      FnCommand(this.sock, this.command);
      return true;
    }
    return Fail('NotFound');
  }
  return false;
}

function generateCommand<
  T extends GenConfig = GenConfig,
  SC extends keyof T['SubCommands'] = keyof T['SubCommands'],
  RB extends keyof T['ReplyButtons'] = keyof T['ReplyButtons'],
  RL extends keyof T['ReplyList'] = keyof T['ReplyList'],
>(config: T, infos: GenInfos<SC, RB, RL>): void {
  function CommandFC(sock: WASocket, command: Command) {
    const MSG = {
      NotImplemented() {
        command.sendText(defaultMsgs.notImplemented);
      },
      NotExist() {
        command.sendText(defaultMsgs.notExist);
      },
    };
    const That = { sock, command };
    const ExecutedList = ExecCommand.call(That, {
      CheckType: command.isListReply,
      commands: config.ReplyList,
      index: command.listReply.args[0],
      onFail: MSG.NotImplemented,
    });
    if (ExecutedList) return;
    const ExecutedButtonReply = ExecCommand.call(That, {
      CheckType: command.isButtonReply,
      commands: config.ReplyButtons,
      index: command.buttonReply.args[0],
      onFail: MSG.NotImplemented,
    });
    if (ExecutedButtonReply) return;
    const ExecutedSubCommand = ExecCommand.call(That, {
      CheckType: !!command.subCommand,
      commands: config.SubCommands,
      index: command.subCommand,
      onFail: (ctx) => {
        console.log(ctx);
        if (ctx == 'NoCommand' && config.SubCommand)
          return config.SubCommand(sock, command);
        MSG.NotExist();
      },
    });
    if (ExecutedSubCommand) return;
    config.Command(sock, command);
  }
  Commands.Register(infos, CommandFC);
}

export { makeCommand, generateCommand };
