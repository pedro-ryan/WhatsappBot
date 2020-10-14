const { google } = require('googleapis');
const imageDownloader = require('image-downloader');
const path = require('path');
const fs = require('fs');

const customSearch = google.customsearch('v1');
const googleSearchCredentials = require('../credentials/google-search.json');

async function CommandImage(client, message, CommandAndParams) {
  if (!CommandAndParams.ConcatenatedParams) {
    client.sendText(
      message.from,
      'O comando "!image" precisa de um segundo parâmetro EX: !image <Nome da Imagem>',
    );
  }
  async function FetchImagesLinks(query) {
    const response = await customSearch.cse.list({
      auth: googleSearchCredentials.apiKey,
      cx: googleSearchCredentials.searchEngineId,
      searchType: 'image',
      q: query,
      num: 3,
    });
    const Links = response.data.items.map((value) => value.link);
    return Links;
  }
  try {
    client.sendText(
      message.from,
      `Pesquisando... "${CommandAndParams.ConcatenatedParams}"`,
    );
    const ImagesLinks = await FetchImagesLinks(
      CommandAndParams.ConcatenatedParams,
    );
    console.log(ImagesLinks);
    ImagesLinks.map((value, index) => {
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
            .then(() => fs.unlinkSync(filename))
            .catch((err) => console.log(err));
        })
        .catch((err) => {
          console.log(err);
        });
      return value;
    });
  } catch (error) {
    console.error(error);
  }
}

module.exports = CommandImage;
