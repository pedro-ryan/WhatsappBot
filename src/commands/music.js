const ytsr = require('yt-search');
const youtubedl = require('youtube-dl');
const ffmpegPath = require('ffmpeg-static');
const Ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

async function CommandMusic(client, message, CommandAndParams) {
  function isDirEmpty(dirname) {
    return fs.promises.readdir(dirname).then((files) => files.length === 0);
  }
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
  const tempFolder = path.join(__dirname, '../Temp/music', message.from);
  if (!fs.existsSync(tempFolder)) {
    fs.mkdirSync(tempFolder);
  }
  async function MessageError() {
    client.sendText(
      message.from,
      'Erro no servidor... Tente Novamente Mais Tarde',
    );
    if (fs.existsSync(tempFolder) && (await isDirEmpty(tempFolder))) {
      fs.rmdirSync(tempFolder);
    }
  }
  function sendFile(fileName) {
    const RemoveFileAndDir = async (format) => {
      if (fs.existsSync(path.join(tempFolder, `${fileName}.${format}`))) {
        fs.unlinkSync(path.join(tempFolder, `${fileName}.${format}`));
      }
      if (fs.existsSync(tempFolder) && (await isDirEmpty(tempFolder))) {
        fs.rmdirSync(tempFolder);
      }
    };
    Ffmpeg(path.join(tempFolder, `/${fileName}.mp4`))
      .setFfmpegPath(ffmpegPath)
      .withAudioCodec('libmp3lame')
      .toFormat('mp3')
      .outputOptions('-id3v2_version', '4')
      .on('end', () => {
        RemoveFileAndDir('mp4');
        client.sendText(message.from, 'Iniciando Envio...');
        client
          .sendFile(message.from, path.join(tempFolder, `${fileName}.mp3`))
          .then(() => {
            RemoveFileAndDir('mp3');
          })
          .catch(() => {
            RemoveFileAndDir('mp3');
            MessageError();
          });
      })
      .save(path.join(tempFolder, `${fileName}.mp3`));
  }

  if (!CommandAndParams.ConcatenatedParams) {
    return client.sendText(
      message.from,
      'Comando *"!music"* precisa de um segundo parâmetro EX: *!music "Nome da Musica"*',
    );
  }

  const SearchTerm = CommandAndParams.ConcatenatedParams;
  console.log(SearchTerm);

  client.sendText(message.from, `Pesquisando... "${SearchTerm}"`);
  const VideoData = await ytsr(SearchTerm).catch((err) => {
    MessageError();
    console.log(err);
  });
  console.log(VideoData.videos[0]);
  const videoInfo = VideoData.videos[0];

  client.sendText(
    message.from,
    `Titulo: ${videoInfo.title} | Duração: (${videoInfo.duration.timestamp}) | o Download começara em breve...`,
  );

  // add confirmation...

  const video = youtubedl(videoInfo.url);

  video.on('error', (err) => {
    console.log(err);
    MessageError();
  });

  const VideoName = cleanFileName(videoInfo.title);

  video.on('info', () => {
    client.sendText(message.from, 'Download Iniciado...');
  });

  video.pipe(
    fs
      .createWriteStream(path.join(tempFolder, `/${VideoName}.mp4`))
      .on('close', () => {
        sendFile(VideoName);
      }),
  );
}

module.exports = CommandMusic;
