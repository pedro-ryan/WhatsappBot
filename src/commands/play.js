const ytsr = require('ytsr');
const youtubedl = require('youtube-dl');
const ffmpegPath = require('ffmpeg-static');
const Ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

async function CommandPlay(client, message, CommandAndParams) {
  function cleanFileName(fileName) {
    const NameReplacements = [
      [/'/g, ''],
      [/\|/g, ''],
      [/'/g, ''],
      [/\//g, ''],
      [/\?/g, ''],
      [/:/g, ''],
      [/;/g, ''],
    ];
    NameReplacements.map(
      // eslint-disable-next-line no-return-assign, no-param-reassign
      (replace) => (fileName = fileName.replace(replace[0], replace[1])),
    );
    return fileName;
  }
  const tempFolder = path.join(__dirname, '../Temp/play', message.from);
  if (!fs.existsSync(tempFolder)) {
    fs.mkdirSync(tempFolder);
  }
  function MessageError() {
    client.sendText(
      message.from,
      'Erro no servidor... Tente Novamente Mais Tarde',
    );
    if (fs.existsSync(tempFolder)) {
      fs.rmdirSync(tempFolder);
    }
  }
  function sendFile(fileName) {
    const MessageOfSending = () => {
      client.sendText(message.from, 'Iniciando Envio...');
    };
    if (CommandAndParams.Params['-video']) {
      MessageOfSending();
      client
        .sendFile(message.from, path.join(tempFolder, `${fileName}.mp4`))
        .then(() => {
          fs.unlinkSync(path.join(tempFolder, `${fileName}.mp4`));
          if (fs.existsSync(tempFolder)) {
            fs.rmdirSync(tempFolder);
          }
        });
    } else {
      Ffmpeg(path.join(tempFolder, `/${fileName}.mp4`))
        .setFfmpegPath(ffmpegPath)
        .withAudioCodec('libmp3lame')
        .toFormat('mp3')
        .outputOptions('-id3v2_version', '4')
        .on('end', () => {
          fs.unlinkSync(path.join(tempFolder, `${fileName}.mp4`));
          MessageOfSending();
          client
            .sendFile(message.from, path.join(tempFolder, `${fileName}.mp3`))
            .then(() => {
              fs.unlinkSync(path.join(tempFolder, `${fileName}.mp3`));
              if (fs.existsSync(tempFolder)) {
                fs.rmdirSync(tempFolder);
              }
            })
            .catch(() => {
              fs.unlinkSync(path.join(tempFolder, `${fileName}.mp3`));
              MessageError();
            });
        })
        .save(path.join(tempFolder, `${fileName}.mp3`));
    }
  }

  if (CommandAndParams.Params.length === 0) {
    return client.sendText(
      message.from,
      'Comando *"!play"* precisa de um segundo parâmetro EX: *!play "Nome da Musica"*',
    );
  }

  const SearchTerm = CommandAndParams.ConcatenatedParams;

  client.sendText(message.from, `Pesquisando... "${SearchTerm}"`);
  console.log(SearchTerm);
  const { items } = await ytsr(SearchTerm, { limit: 1 }).catch((err) => {
    MessageError();
    console.log(err);
  });
  console.log(items);

  client.sendText(
    message.from,
    `Titulo: ${items[0].title} | Duração: (${items[0].duration}) | o Download começara em breve...`,
  );

  const video = youtubedl(items[0].link);

  video.on('error', (err) => {
    console.log(err);
    MessageError();
  });

  const VideoName = cleanFileName(items[0].title);

  video.pipe(
    fs
      .createWriteStream(path.join(tempFolder, `/${VideoName}.mp4`))
      .on('close', () => {
        sendFile(VideoName);
      }),
  );
}

module.exports = CommandPlay;
