/* eslint-disable no-param-reassign */
function FilterInput(message) {
  function SeparateWords() {
    switch (message.type) {
      case 'chat':
        return message.body.split(' ');
      case 'image':
        return message.caption.split(' ');
      default:
        return message.body.split(' ');
    }
  }
  function getParams(WordsArray, CommandAndParams) {
    if (WordsArray[0].trim().startsWith('!')) {
      CommandAndParams.PureCommand = WordsArray[0].toLowerCase();
      CommandAndParams.Command = WordsArray[0].toLowerCase().replace('!', '');
      WordsArray.shift();

      WordsArray.map((Value) => {
        if (Value.length > 0) {
          if (Value.trim().startsWith('-') && Value.length > 1) {
            CommandAndParams.Params[Value] = true;
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
    Params.map((value, index, array) => {
      const IndexNextParam = WordsArray.indexOf(array[index + 1]);
      const Results = WordsArray.slice(
        WordsArray.indexOf(value) + 1,
        IndexNextParam !== -1 ? IndexNextParam : undefined,
      );
      if (Results.length > 0) {
        Results.map((valueParam) => {
          const indexParam = CommandAndParams.Params.default.lastIndexOf(
            valueParam,
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
  getParamsOfParams(WordsArray, CommandAndParams);

  CommandAndParams.ConcatenatedParams = CommandAndParams.Params.default.join(
    ' ',
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
