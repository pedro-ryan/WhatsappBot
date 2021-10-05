function FilterInput(message) {
  // console.log(message);
  function SeparateWords() {
    switch (message.type) {
      case 'chat':
        return message.body?.split(' ');
      case 'image':
        return message.caption?.split(' ');
      case 'video':
        return message.caption?.split(' ');
      default:
        break;
    }
  }
  function getParams(WordsArray, CommandAndParams) {
    if (WordsArray && WordsArray[0].trim().startsWith('!')) {
      CommandAndParams.PureCommand = WordsArray[0].toLowerCase();
      CommandAndParams.Command = WordsArray[0].toLowerCase().replace('!', '');
      WordsArray.shift();

      WordsArray.map((Value) => {
        if (Value.length > 0) {
          if (Value.trim().startsWith('-') && Value.length > 1) {
            const param = Value.toLowerCase().replace('-', '');
            CommandAndParams.Params[param] = true;
          } else {
            CommandAndParams.Params.default.push(Value);
          }
        }
        return Value;
      });
    }
  }
  function getParamsOfParams(WordsArray, CommandAndParams) {
    const Params = Object.keys(CommandAndParams.Params).slice(1);
    const Words = WordsArray.map((value) => value.replace('-', ''));
    Params.map((value, index, array) => {
      const IndexNextParam = Words.indexOf(array[index + 1]);
      const Results = Words.slice(
        Words.indexOf(value) + 1,
        IndexNextParam !== -1 ? IndexNextParam : undefined
      );
      if (Results.length > 0) {
        Results.map((valueParam) => {
          const indexParam = CommandAndParams.Params.default.lastIndexOf(
            valueParam
          );
          if (indexParam > -1) {
            CommandAndParams.Params.default.splice(indexParam, 1);
          }
          return valueParam;
        });
        CommandAndParams.Params[value] = Results;
      }
      return Results;
    });
  }
  const WordsArray = SeparateWords();
  const CommandAndParams = {
    PureCommand: undefined,
    Command: undefined,
    Params: {
      default: [],
    },
    ConcatenatedParams: '',
  };

  getParams(WordsArray, CommandAndParams);
  if (!CommandAndParams.PureCommand) {
    return null;
  }
  getParamsOfParams(WordsArray, CommandAndParams);

  CommandAndParams.ConcatenatedParams = CommandAndParams.Params.default.join(
    ' '
  );
  if (message.sender.isMe) {
    message.from = message.to;
  }
  console.log(CommandAndParams);
  return CommandAndParams;
}

module.exports = {
  FilterInput,
};
