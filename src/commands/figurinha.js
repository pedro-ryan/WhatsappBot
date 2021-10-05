const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const base64scripts = require('../scripts/base64');

async function newfigure(client, message, CommandAndParams) {
  function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async function isDirEmpty(dirname) {
    const files = await fs.promises.readdir(dirname);
    return files.length === 0;
  }
  const RemoveFileAndDir = async (tempFolder, fileName) => {
    if (fs.existsSync(fileName)) {
      fs.unlinkSync(fileName);
    }
    if (fs.existsSync(tempFolder) && (await isDirEmpty(tempFolder))) {
      fs.rmdirSync(tempFolder);
    }
  };
  if (message.isMedia === true || message.isMMS === true) {
    const tempFolder = path.join(__dirname, '../Temp/newfigure', message.from);
    if (!fs.existsSync(tempFolder)) {
      fs.mkdirSync(tempFolder);
    }
    const downloadImage = async () => {
      try {
        const base64 = await client.downloadMedia(message);
        const buffer = base64scripts.decodeBase64Image(base64);
        const fileName = path.join(
          tempFolder,
          `${Math.random()}.${mime.extension(message.mimetype)}`,
        );
        // console.log(fileName);
        fs.writeFileSync(fileName, buffer.data, 'base64');
        return fileName;
      } catch (error) {
        console.error(error);
      }
      return undefined;
    };
    const fileName = await downloadImage();
    if (fileName) {
      if (!message.isGif) {
        await client.sendImageAsSticker(message.from, fileName);
        RemoveFileAndDir(tempFolder, fileName);
      } else {
        const fileNameGif = fileName.replace('.mp4', '.gif');
        ffmpeg(fileName)
          .setFfmpegPath(ffmpegPath)
          .aspect('4:3')
          .outputOption('-vf', 'scale=512:512:flags=lanczos,fps=15')
          .on('start', (commandLine) => {
            console.log(`Spawned Ffmpeg with command: ${commandLine}`);
          })
          .on('end', async () => {
            console.log('Finished processing');
            console.log(fileNameGif);
            await client.sendImageAsStickerGif(message.from, fileNameGif);
            RemoveFileAndDir(tempFolder, fileNameGif);
            RemoveFileAndDir(tempFolder, fileName);
          })
          .save(fileNameGif);
      }
    } else {
      RemoveFileAndDir(tempFolder, fileName);
    }
  } else {
    client.sendText(
      message.from,
      'Este Comando Precisa ser Usado na Legenda de uma imagem',
    );
  }
}

module.exports = newfigure;
