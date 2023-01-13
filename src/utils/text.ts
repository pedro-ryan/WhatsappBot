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
  return `${topLeft}${horizontal.repeat(26)}${topRight}`;
};
const lineBox = (style: StyleBox) => {
  const { centerLeft, horizontal, centerRight } = Box[style];
  return `${centerLeft}${horizontal.repeat(26)}${centerRight}`;
};
const bottomBox = (style: StyleBox) => {
  const { bottomLeft, horizontal, bottomRight } = Box[style];
  return `${bottomLeft}${horizontal.repeat(26)}${bottomRight}`;
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
  let maxChar = 27;
  if (revertBold(rawTxt).length !== rawTxt.length) maxChar = 24;

  const centralize = (txt: string, char = ' ') => {
    const charToAdd = Math.max(
      (maxChar - revertBold(removeStyle(txt)).length) / 2 / char.length,
      0,
    );
    const left = char.repeat(charToAdd);
    const right = char.repeat(Math.ceil(charToAdd));
    return left + txt + right;
  };

  if (txtNoStyle.length === maxChar) {
    return rawTxt;
  } else if (txtNoStyle.length > maxChar && !trim) {
    let result: string[][] = [];
    let pointer = 0;
    txtNoStyle.split(' ').forEach((v) => {
      if ((result[pointer]?.join(' ').length || 0) + v.length >= maxChar)
        pointer += 1;
      if (!result[pointer]) result[pointer] = [];
      result[pointer].push(v);
    });
    return result.map((v) => centralize(v.join(' '), rawChar)).join('\r\n');
  }
  let result = centralize(rawTxt, rawChar);
  if (result.length > maxChar && trim) {
    const transform = result.slice(0, maxChar).split('');
    transform.splice(-3, 3, '...');
    result = transform.join('');
  }
  return result;
};

const monospace = (txt: string) => {
  return `\`\`\`${removeStyle(txt)}\`\`\``;
};

export { monospace, bold, makeCenter, revertBold, removeStyle };
export { lineBox, topBox, bottomBox, textBox };
