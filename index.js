/* eslint-disable prefer-const */
/* eslint-disable operator-linebreak */
const venom = require('venom-bot');
const ytsr = require('ytsr');
const YoutubeMp3Downloader = require('youtube-mp3-downloader');
const ffmpegDir = require('ffmpeg-static');
const querystring = require('querystring');
const fs = require('fs');

const ytDownloader = new YoutubeMp3Downloader({
  ffmpegPath: ffmpegDir,
  outputPath: './downloads',
});

function start(client) {
  function CreateMensagem(message, CommandAndParams, { Comando, Retorno }) {
    if (CommandAndParams[0] === Comando) {
      return client
        .sendText(message.from, Retorno)
        .then((result) => {
          console.log('Result: ', result); // return object success
        })
        .catch((erro) => {
          console.error('Error when sending: ', erro); // return object error
        });
    }
  }

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
    const CommandAndParams = message.body.split(' ');

    CreateMensagem(message, CommandAndParams, {
      Comando: '!hi',
      Retorno: `Olá ${message.sender.name}`,
    });

    if (CommandAndParams[0] === '!play') {
      if (!CommandAndParams[1]) {
        return client.sendText(
          message.from,
          'Comando *"!play"* precisa de um segundo parâmetro EX: *!play "Nome da Musica"*',
        );
      }
      const VideoName = CommandAndParams.map((value, index) => {
        if (index !== 0) {
          return value;
        }
        return null;
      }).join(' ');
      client.sendText(message.from, `Pesquisando... "${VideoName}"`);
      console.log(VideoName);
      const { items } = await ytsr(VideoName, { limit: 1 });
      console.log(items);
      client.sendText(
        message.from,
        `Titulo: ${items[0].title} | Duração: (${items[0].duration}) | o Download começara em breve...`,
      );
      const QueryLink = querystring.parse(items[0].link);
      console.log(QueryLink);
      ytDownloader.download(Object.values(QueryLink)[0]);

      ytDownloader.on('finished', () => {
        let VideoTitle = items[0].title;
        let NameVideo = VideoTitle.replace('|', '');
        client.sendText(message.from, 'Iniciando Envio...');
        client
          .sendFile(
            message.from,
            `./downloads/${NameVideo}.mp3`,
            `${items[0].title}.mp3`,
            items[0].title,
          )
          .then(() => {
            fs.unlinkSync(`./downloads/${NameVideo}.mp3`);
          })
          .catch((err) => {
            console.log(err);
          });
      });
      ytDownloader.on('error', (err) => {
        client.sendText(message.from, 'Erro no Servidor...');
        console.log(err);
      });
    }

    return null;
  });
}

venom
  .create('WhatsappBot', undefined, undefined, {
    headless: false,
    // disableSpins: true,
    // disableWelcome: true,
  })
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });
