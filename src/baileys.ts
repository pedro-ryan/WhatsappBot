import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
} from '@adiwajshing/baileys';
import { Boom } from '@hapi/boom';
import fs from 'fs';
import botConfig from '../bot.config';
import Commands from './commands';
import { makeCommand } from './utils';

const tokenFolder = 'db/tokens/baileys';

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState(tokenFolder);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    patchMessageBeforeSending: (message) => {
      const requiresPatch = !!(
        message.buttonsMessage ||
        message.templateMessage ||
        message.listMessage
      );
      if (requiresPatch) {
        message = {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadataVersion: 2,
                deviceListMetadata: {},
              },
              ...message,
            },
          },
        };
      }
      return message;
    },
    browser: ['Whatsapp Bot', 'Desktop', '20.0.04'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log(
        'connection closed due to ',
        lastDisconnect?.error,
        ', reconnecting ',
        shouldReconnect,
      );
      // reconnect if not logged out
      if (shouldReconnect) {
        start();
      } else if (fs.existsSync(tokenFolder)) {
        fs.rmSync(tokenFolder, { force: true, recursive: true });
      }
    } else if (connection === 'open') {
      console.log('opened connection');
      await sock.sendPresenceUpdate('unavailable');
      // const groups = await sock.groupFetchAllParticipating();
      // Object.values(groups).forEach((value) => {
      //   if (enabledGroups.some((el) => el === value.subject)) {
      //     enabledGroupsId.push(value.id);
      //   }
      // });
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type === 'notify') {
      messages.forEach(async (message) => {
        if (!message.key.remoteJid) {
          console.log('not contain remote JID: ', message);
          return;
        }

        if (
          botConfig.private &&
          !botConfig.enabledIds.some((el) => el === message.key.remoteJid)
        )
          return;
        if (botConfig.bannedIds.some((el) => el === message.key.remoteJid))
          console.log(JSON.stringify(message, null, 2));
        const command = makeCommand(message, sock);
        console.log('command', JSON.stringify(command, null, 2));
        if (botConfig.onlyMe && !command.isMe) return;
        if (!command.isCommand) return;
        const commandFunction = Commands[command.command];
        if (!commandFunction)
          return command.sendText('Infelizmente esse comando não existe');
        commandFunction(sock, command);
      });
    }
    // else {
    //   console.log('appended :D', messages);
    // }
  });

  sock.ev.on('messages.media-update', ([{ key, error, media }]) => {
    console.log('media update', key, error, media);
  });
}

start();
