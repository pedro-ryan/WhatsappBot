const ytsr = require('yt-search');
const youtubedl = require('youtube-dl');
const fs = require('fs');
const path = require('path');
const temp = require('temp').track();

async function CommandVideo(client, message, CommandAndParams) {
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
  const tempFolder = path.join(__dirname, '../Temp/video', message.from);
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
  function sendFile(fileName, pathToArchive) {
    const RemoveFileAndDir = async (format) => {
      if (fs.existsSync(path.join(tempFolder, `${fileName}.${format}`))) {
        fs.unlinkSync(path.join(tempFolder, `${fileName}.${format}`));
      }
      if (fs.existsSync(tempFolder) && (await isDirEmpty(tempFolder))) {
        fs.rmdirSync(tempFolder);
      }
    };
    client.sendText(message.from, 'Iniciando Envio...');
    console.log(pathToArchive);
    client
      .sendFile(
        message.from,
        // temp.path({ prefix: fileName, suffix: '.mp4', dir: tempFolder }),
        pathToArchive,
      ) // path.join(tempFolder, `${fileName}.mp4`))
      .then(() => {
        RemoveFileAndDir('mp4');
      })
      .catch(console.error);
  }

  if (!CommandAndParams.ConcatenatedParams) {
    return client.sendText(
      message.from,
      'Comando *"!video"* precisa de um segundo parâmetro >>> *!video Titulo do Video*',
    );
  }

  const SearchTerm = CommandAndParams.ConcatenatedParams;

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
    MessageError();
    console.log(err);
  });

  const VideoName = cleanFileName(videoInfo.title);
  console.log(VideoName);

  video.on('info', () => {
    client.sendText(message.from, 'Download Iniciado...');
  });

  // fs
  // .createWriteStream(path.join(tempFolder, `/${VideoName}.mp4`))
  // .on('close', () => {
  //   sendFile(VideoName);
  // }),
  const stream = temp.createWriteStream({
    prefix: VideoName,
    suffix: '.mp4',
    dir: tempFolder,
  });

  video.pipe(
    stream.on('close', () => {
      sendFile(VideoName, stream.path);
    }),
  );
}

module.exports = CommandVideo;
