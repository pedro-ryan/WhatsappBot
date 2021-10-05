const { google } = require('googleapis');
const imageDownloader = require('image-downloader');
const path = require('path');
const fs = require('fs');

const customSearch = google.customsearch('v1');

async function CommandImage(client, message, CommandAndParams) {
  if (!CommandAndParams.ConcatenatedParams) {
    return client.sendText(
      message.from,
      'O comando "!image" precisa de um segundo parâmetro EX: !image <Nome da Imagem>',
    );
  }
  async function FetchImagesLinks(query, Amount) {
    // const num = Amount || 3;
    const response = await customSearch.cse.list({
      auth: process.env.ApiKey,
      cx: process.env.SearchEngineId,
      searchType: 'image',
      q: query,
      num: 20,
    });
    const Links = response.data.items.map((value) => value.link);
    return Links;
  }
  try {
    client.sendText(
      message.from,
      `Pesquisando... "${CommandAndParams.ConcatenatedParams}"`,
    );
    const Amount = CommandAndParams.Params.amount?.[0] || 3;
    if (Amount > 10) {
      client.sendText(
        message.from,
        'O Máximo de Imagens que podem ser baixadas em 1 comando são 10 ',
      );
    }
    const ImagesLinks = await FetchImagesLinks(
      CommandAndParams.ConcatenatedParams,
      // Amount > 10 ? 10 : Amount,
    );
    console.log(ImagesLinks);
    ImagesLinks.map((value, index) => {
      if (index + 1 === Amount) {
        return value;
      }
      imageDownloader
        .image({
          url: value,
          dest: path.join(
            __dirname,
            '../Temp/image',
            `/[${index}][${Math.random()}]-${message.from}.jpg`,
          ),
          extractFilename: false,
        })
        .then(({ filename }) => {
          client
            .sendImage(message.from, filename)
            // .then(() => fs.unlinkSync(filename))
            .catch((err) => console.log(err));
        })
        .catch((err) => {
          console.log(err);
          // throw err;
        });
      return value;
    });
  } catch (error) {
    console.error(error);
  }
}

module.exports = CommandImage;
