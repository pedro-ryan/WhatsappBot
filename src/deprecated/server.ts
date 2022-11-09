// import * as venom from 'venom-bot';
// import Commands from '../commands';
// import { FilterInput, isCommand } from './helpers/CommandsAndParams';

// function start(client: venom.Whatsapp) {
//   client.onStateChange((state) => {
//     console.log(state);
//     let TimeoutReconnect: ReturnType<typeof setTimeout> | undefined;
//     const conflicts = [
//       venom.SocketState.CONFLICT,
//       venom.SocketState.UNPAIRED,
//       venom.SocketState.UNLAUNCHED,
//     ];
//     if (conflicts.includes(state)) {
//       TimeoutReconnect = setTimeout(() => client.useHere(), 3600000);
//     } else if (TimeoutReconnect) {
//       clearTimeout(TimeoutReconnect);
//     }
//   });

//   client.onAnyMessage((message) => {
//     if (
//       !message.isGroupMsg ||
//       message.type !== 'chat' ||
//       message.chat.contact.name !== 'Baixar Vídeos'
//     )
//       return null;
//     if (isCommand(message)) {
//       console.log('Command detected');
//       const CommandAndParams = FilterInput(message);
//       console.log(CommandAndParams);
//       if (CommandAndParams.PureCommand) {
//         const Command = Commands[CommandAndParams.Command] || Commands.help;
//         Command(client, message, CommandAndParams);
//       }
//     }
//   });
// }

// venom
//   .create({
//     session: 'WhatsappBot',
//     headless: false,
//     disableSpins: false,
//     disableWelcome: false,
//     browserArgs: [
//       '--no-sandbox',
//       '--disable-setuid-sandbox',
//       '--disable-dev-shm-usage',
//     ],
//   })
//   .then((client) => start(client))
//   .catch((erro) => {
//     console.error(erro);
//   });
