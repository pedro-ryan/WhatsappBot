const venom = require('venom-bot');
const Commands = require('./commands');
const HelperCommandsAndParams = require('./helpers/CommandsAndParams');

function start(client) {
  client.onStateChange((state) => {
    console.log(state);
    let TimeoutReconnect;
    const conflicts = [
      venom.SocketState.CONFLICT,
      venom.SocketState.UNPAIRED,
      venom.SocketState.UNLAUNCHED,
    ];
    if (conflicts.includes(state)) {
      TimeoutReconnect = setTimeout(() => client.useHere(), 3600000);
    } else {
      clearTimeout(TimeoutReconnect);
    }
  });

  client.onAnyMessage(async (message) => {
    const CommandAndParams = HelperCommandsAndParams.FilterInput(message);
    if (CommandAndParams.PureCommand) {
      const Command = Commands[CommandAndParams.Command] || Commands.help;
      Command(client, message, CommandAndParams);
    }
  });
}

venom
  .create('WhatsappBot', undefined, undefined, {
    headless: true,
    disableSpins: true,
    disableWelcome: true,
    browserArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  })
  .then((client) => start(client))
  .catch((erro) => {
    console.error(erro);
  });
