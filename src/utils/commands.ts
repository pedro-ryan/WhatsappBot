import { proto, WASocket } from '@adiwajshing/baileys';
import {
  buttonResponse,
  Command,
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


const makeCommand: MakeCommand = (message, sock) => {
  const isReply = !!message.message?.extendedTextMessage;
  console.log(message.message);
  const result: RawCommand = {
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
export { makeCommand };
