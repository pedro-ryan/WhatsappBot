import { proto } from '@adiwajshing/baileys';
import {
  buttonResponse,
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

const removeStyle = (txt: string) => {
  let result = txt;
  ['*', '```', '~', '_'].forEach((rm) => {
    const splitted = result.split(rm);
    const actualStyle = [];
    while (splitted.length > 0) {
      const actual = splitted.splice(0, 1)[0];
      const next = splitted[0] || '';
      const pair = splitted.lastIndexOf(actual);
      if (!actual && next !== '' && next[0] !== ' ' && pair > -1) {
        splitted.splice(pair, 1);
      } else {
        actualStyle.push(actual);
      }
      result = actualStyle.join(rm);
    }
  });
  return result;
};

const UpperDiff = '𝗔'.codePointAt(0)! - 'A'.codePointAt(0)!;
const LowerDiff = '𝗮'.codePointAt(0)! - 'a'.codePointAt(0)!;

function bold(word: string) {
  return [...word]
    .map((char) => {
      const n = char.charCodeAt(0);
      // n >= 'A' && n <= 'Z'
      if (n >= 65 && n < 91) return String.fromCodePoint(n + UpperDiff);
      // n >= 'a' && n <= 'z'
      if (n >= 97 && n < 123) return String.fromCodePoint(n + LowerDiff);
      return char;
    })
    .join('');
}
function revertBold(word: string) {
  return [...word]
    .map((char) => {
      const n = char.codePointAt(0)!;
      // n >= bold '𝗔' && n <= bold '𝗭'
      if (n >= 120276 && n < 120302) return String.fromCodePoint(n - UpperDiff);
      // n >= bold '𝗮' && n <= bold '𝘇'
      if (n >= 120302 && n < 120328) return String.fromCodePoint(n - LowerDiff);
      return char;
    })
    .join('');
}

const Box = {
  line: {
    topLeft: '┌',
    topRight: '┐',
    bottomLeft: '└',
    bottomRight: '┘',
    centerLeft: '├',
    centerRight: '┤',
    vertical: '│',
    horizontal: '─',
  },
  doubleLine: {
    topLeft: '╔',
    topRight: '╗',
    bottomLeft: '╚',
    bottomRight: '╝',
    centerLeft: '╠',
    centerRight: '╣',
    vertical: '║',
    horizontal: '═',
  },
};
type StyleBox = keyof typeof Box;

const topBox = (style: StyleBox) => {
  const { topLeft, horizontal, topRight } = Box[style];
  return `${topLeft}${horizontal.repeat(27)}${topRight}`;
};
const lineBox = (style: StyleBox) => {
  const { centerLeft, horizontal, centerRight } = Box[style];
  return `${centerLeft}${horizontal.repeat(27)}${centerRight}`;
};
const bottomBox = (style: StyleBox) => {
  const { bottomLeft, horizontal, bottomRight } = Box[style];
  return `${bottomLeft}${horizontal.repeat(27)}${bottomRight}`;
};
const textBox = (txt: string, style: StyleBox, char = ' ') => {
  const centered = makeCenter(txt, char).split('');
  const { vertical } = Box[style];

  centered.splice(0, 1, vertical);
  centered.splice(-1, 1, vertical);

  return centered.join('');
};

const makeCenter = (rawTxt: string, rawChar = ' ', trim = true) => {
  const txtNoStyle = removeStyle(rawTxt);
  let maxChar = 28;
  if (revertBold(rawTxt).length !== rawTxt.length) maxChar = 26;

  const centralize = (txt: string, char = ' ') => {
    const charToAdd =
      (maxChar - revertBold(removeStyle(txt)).length) / 2 / char.length;
    const left = char.repeat(charToAdd);
    const right = char.repeat(Math.ceil(charToAdd));
    return left + txt + right;
  };

  if (txtNoStyle.length === 28) {
    return rawTxt;
  } else if (txtNoStyle.length > 28 && !trim) {
    let result: string[][] = [];
    let pointer = 0;
    txtNoStyle.split(' ').forEach((v) => {
      if ((result[pointer]?.join(' ').length || 0) + v.length >= 28)
        pointer += 1;
      if (!result[pointer]) result[pointer] = [];
      result[pointer].push(v);
    });
    return result.map((v) => centralize(v.join(' '), rawChar)).join('\r\n');
  }
  let result = centralize(rawTxt, rawChar);
  if (result.length > 28 && trim) {
    const transform = result.split('');
    transform.splice(-3, 3, '...');
    result = transform.join('');
  }
  return result;
};

const monospace = (txt: string) => {
  return `\`\`\`${removeStyle(txt)}\`\`\``;
};

export { monospace, bold, makeCenter, revertBold, removeStyle, makeCommand };
export { lineBox, topBox, bottomBox, textBox };
