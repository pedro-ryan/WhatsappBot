import { Message } from 'venom-bot';
export interface CommandAndParams {
  PureCommand: string;
  Command: string;
  Params: {
    [key: string]: string | boolean | string[];
    default: string[];
  };
  ConcatenatedParams: string;
}

function SeparateWords(message: Message): string[] {
  switch (message.type) {
    case 'image':
      return message.caption.split(' ');
    default:
      return message.body.split(' ');
  }
}

function getCommand(WordsArray: string[], CommandAndParams: CommandAndParams) {
  CommandAndParams.PureCommand = WordsArray[0].toLowerCase();
  CommandAndParams.Command = WordsArray[0].toLowerCase().replace('!', '');
}

function getParams(WordsArray: string[], CommandAndParams: CommandAndParams) {
  WordsArray.shift();

  WordsArray.forEach((Value) => {
    if (Value.length <= 0) return;

    if (Value.trim().startsWith('-') && Value.length > 1) {
      CommandAndParams.Params[Value] = true;
      return;
    }

    CommandAndParams.Params.default.push(Value);
  });
}

function getParamsOfParams(
  WordsArray: string[],
  CommandAndParams: CommandAndParams,
) {
  const Params = Object.keys(CommandAndParams.Params).slice(1);
  const defaultParams = CommandAndParams.Params.default;

  Params.forEach((value, index) => {
    const IndexNextParam = WordsArray.indexOf(Params[index++]);
    const Results = WordsArray.slice(
      WordsArray.indexOf(value) + 1,
      IndexNextParam !== -1 ? IndexNextParam : undefined,
    );

    if (Results.length <= 0) return;

    Results.forEach((valueParam) => {
      const indexParam = defaultParams.lastIndexOf(valueParam);

      if (indexParam <= -1) return;

      CommandAndParams.Params.default.splice(indexParam, 1);
    });

    CommandAndParams.Params[value] = Results;
  });
}

export function isCommand(message: Message): Boolean {
  const Words = SeparateWords(message);
  return Words[0].trim().startsWith('!');
}

export function FilterInput(message: Message): CommandAndParams {
  const CommandAndParams: CommandAndParams = {
    PureCommand: '',
    ConcatenatedParams: '',
    Command: '',
    Params: {
      default: [],
    },
  };

  const WordsArray = SeparateWords(message);

  getCommand(WordsArray, CommandAndParams);
  getParams(WordsArray, CommandAndParams);
  getParamsOfParams(WordsArray, CommandAndParams);

  CommandAndParams.ConcatenatedParams =
    CommandAndParams.Params.default.join(' ');

  if (message.sender.isMe) {
    message.from = message.to;
  }

  return CommandAndParams;
}
