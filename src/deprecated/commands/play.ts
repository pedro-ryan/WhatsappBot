import ffmpegPath from 'ffmpeg-static';
import Ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { Message, Whatsapp } from 'venom-bot';
import { exec } from 'youtube-dl-exec';
import ytsr, { Video } from 'ytsr';
import { CommandAndParams } from '../../helpers/CommandsAndParams';
import sanitize from '../../helpers/sanitize';

const deleteFolderRecursive = function (directoryPath: string) {
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach((file, index) => {
      const curPath = path.join(directoryPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(directoryPath);
  }
};

async function CommandPlay(
  client: Whatsapp,
  message: Message,
  commandAndParams: CommandAndParams,
) {
  const tempFolder = path.join(__dirname, '../Temp/video', message.from);
  if (!fs.existsSync(tempFolder)) {
    fs.mkdirSync(tempFolder);
  }
  function MessageError() {
    client.sendText(
      message.from,
      'Erro no servidor... Tente Novamente Mais Tarde',
    );
    deleteFolderRecursive(tempFolder);
  }
  function sendFile(fileName: string) {
    const mp4Path = path.join(tempFolder, `${fileName}.mp4`);
    const MessageOfSending = () => {
      client.sendText(message.from, 'Iniciando Envio...');
    };
    if (commandAndParams.Params['-video']) {
      const fileStats = fs.statSync(mp4Path);
      const fileSizeInMb = fileStats.size / (1024 * 1024);
      if (fileSizeInMb < 16.5) {
        MessageOfSending();
        client.sendFile(message.from, mp4Path).then(() => {
          fs.unlinkSync(mp4Path);
          deleteFolderRecursive(tempFolder);
        });
      } else if (fileSizeInMb < 100) {
        // change mime type to mkv
        const mkvPath = path.join(tempFolder, `${fileName}.mkv`);
        Ffmpeg(mp4Path)
          .setFfmpegPath(ffmpegPath)
          .outputOptions('-c copy')
          .output(mkvPath)
          .on('start', () => {
            client.sendText(
              message.from,
              'Arquivo Excede Tamanho Máximo do Whatsapp, Convertendo...',
            );
          })
          .on('end', () => {
            MessageOfSending();
            client.sendFile(message.from, mkvPath).then(() => {
              fs.unlinkSync(mp4Path);
              fs.unlinkSync(mkvPath);
              deleteFolderRecursive(tempFolder);
            });
          })
          .save(mkvPath);
      } else {
        Ffmpeg(mp4Path)
          .setFfmpegPath(ffmpegPath)
          .outputOptions('-c:v libx265', '-crf 28')
          .on('start', () => {
            client.sendText(
              message.from,
              'Arquivo Excede Tamanho Máximo do Whatsapp, Convertendo...',
            );
          })
          .on('end', () => {
            MessageOfSending();
            client.sendFile(message.from, mp4Path).then(() => {
              fs.unlinkSync(mp4Path);
              fs.unlinkSync(mp4Path.replace('.mp4', '-converted.mp4'));
              deleteFolderRecursive(tempFolder);
            });
          })
          .save(mp4Path.replace('.mp4', '-converted.mp4'));
      }
    } else {
      const mp3Path = path.join(tempFolder, `${fileName}.mp3`);
      Ffmpeg(mp4Path)
        .setFfmpegPath(ffmpegPath)
        .withAudioCodec('libmp3lame')
        .toFormat('mp3')
        .outputOptions('-id3v2_version', '4')
        .on('end', () => {
          fs.unlinkSync(mp4Path);
          MessageOfSending();
          client
            .sendVoice(message.from, mp3Path)
            .then(() => {
              fs.unlinkSync(mp3Path);
              deleteFolderRecursive(tempFolder);
            })
            .catch(() => {
              fs.unlinkSync(mp3Path);
              MessageError();
            });
        })
        .save(mp3Path);
    }
  }

  if (commandAndParams.Params.default.length <= 0) {
    return client.sendText(
      message.from,
      'Você precisa informar o nome da música ex: !play nome da música',
    );
  }

  try {
    const SearchTerm = commandAndParams.ConcatenatedParams;

    await client.sendText(message.from, `Pesquisando... "${SearchTerm}"`);

    console.log(SearchTerm);
    const filters = await ytsr.getFilters(SearchTerm);
    const filter = filters.get('Type')?.get('Video')?.url;

    if (!filter)
      return client.sendText(
        message.from,
        'Não foi possível encontrar o vídeo',
      );

    const searchResult = await ytsr(filter, { limit: 1 });
    const item = searchResult.items[0] as Video;

    console.log(item);

    const replyText = `Titulo: ${item.title} | Duração: (${item.duration}) | o Download começara em breve...`;

    await client.sendText(message.from, replyText);

    const VideoName = sanitize(item.title);

    const output = exec(item.url, {
      ffmpegLocation: ffmpegPath,
      output: path.join(tempFolder, `${VideoName}.mp4`),
      format: 'mp4',
    });

    output.stdout.pipe(process.stdout);
    output.stderr.pipe(process.stderr);

    output.on('close', () => {
      sendFile(VideoName);
    });
  } catch (err) {
    MessageError();
    console.log(err);
  }

  // video.on('error', (err) => {
  // });

  // video.pipe(
  //   fs
  //     .createWriteStream(path.join(tempFolder, `/${VideoName}.mp4`))
  //     .on('close', () => {
  //       sendFile(VideoName);
  //     }),
  // );
}

export default CommandPlay;
