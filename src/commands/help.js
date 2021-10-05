const path = require('path');
const fs = require('fs');
const yaml = require('yaml');

function CommandHelp(client, message, CommandAndParams) {
  console.log('HELP!!!!!');
  console.log(CommandAndParams);
  const CommandsYml = fs.readFileSync(
    path.join(__dirname, '../../Commands.yml'),
    'utf-8',
  );
  const CommandInfos = yaml.parse(CommandsYml);
  const AllCommands = Object.keys(CommandInfos);

  const SendHelpCommands = () => {
    client.sendText(
      message.from,
      `Comandos Existentes São : ${AllCommands.join(', ')}`,
    );
    client.sendText(
      message.from,
      'Para saber o que cada Comando faz digite *"!help <comando>"* *EX: !help !play*',
    );
  };

  // if Comando n existir
  if (AllCommands.indexOf(CommandAndParams.PureCommand) === -1) {
    client.sendText(
      message.from,
      `Comando "${CommandAndParams.PureCommand}" não encontrado`,
    );
    SendHelpCommands();
  } else if (CommandAndParams.Params.length === 0) {
    client.sendText(
      message.from,
      'O Comando "!help" Precisa de Um segundo Parametro...',
    );
    SendHelpCommands();
  } else if (CommandInfos[CommandAndParams.Params[0]]) {
    client.sendText(
      message.from,
      `Sobre o Comando ${CommandAndParams.Params[0]}:`,
    );
    client.sendText(
      message.from,
      `Descrição: ${CommandInfos[CommandAndParams.Params[0]].description}`,
    );
    client.sendText(
      message.from,
      `Como Usar: ${CommandInfos[CommandAndParams.Params[0]].use}`,
    );
    client.sendText(
      message.from,
      `Exemplo: ${CommandInfos[CommandAndParams.Params[0]].example}`,
    );
    // client.sendText(
    //   message.from,
    //   `Parâmetros (Obrigatórios): ${
    //     CommandInfos[CommandAndParams.Params[0]].parameters.required
    //   }`,
    // );
    // client.sendText(
    //   message.from,
    //   `Parâmetros (Opcionais): ${
    //     CommandInfos[CommandAndParams.Params[0]].parameters.optional
    //   }`,
    // );
  }
}

module.exports = CommandHelp;
