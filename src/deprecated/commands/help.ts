const CommandInfos = require('../commands-info.json');
import { Message, Whatsapp } from 'venom-bot';
import { CommandAndParams } from '../../helpers/CommandsAndParams';

export default function CommandHelp(
  client: Whatsapp,
  message: Message,
  CommandAndParams: CommandAndParams,
) {
  console.log('HELP!!!!!');
  console.log(CommandAndParams);
  const AllCommands = Object.keys(CommandInfos);

  const SendHelpCommands = () => {
    client.sendText(
      message.from,
      `Comandos Existentes São : ${AllCommands.join(', ')}`,
    );
    client.sendText(
      message.from,
      'Para saber o que cada Comando faz digite *"!help <comando>"* \n*EX: !help !play*',
    );
  };

  // if Comando n existir
  if (AllCommands.indexOf(CommandAndParams.PureCommand) === -1) {
    client.sendText(
      message.from,
      `Comando "${CommandAndParams.PureCommand}" não encontrado`,
    );
    SendHelpCommands();
  } else if (CommandAndParams.Params.default.length === 0) {
    client.sendText(
      message.from,
      'O Comando "!help" Precisa de Um segundo Parâmetro...',
    );
    SendHelpCommands();
  } else if (CommandInfos[CommandAndParams.Params.default[0]]) {
    client.sendText(
      message.from,
      `Sobre o Comando ${CommandAndParams.Params.default[0]}:`,
    );
    client.sendText(
      message.from,
      `Descrição: ${
        CommandInfos[CommandAndParams.Params.default[0]].description
      }`,
    );
    client.sendText(
      message.from,
      `Como Usar: ${CommandInfos[CommandAndParams.Params.default[0]].use}`,
    );
    client.sendText(
      message.from,
      `Exemplo: ${CommandInfos[CommandAndParams.Params.default[0]].example}`,
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
