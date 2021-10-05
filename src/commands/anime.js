const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function GetEpUrl(anime, temp, ep) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(`https://animesonline.cc/?s=${anime}`);
  await page.waitForSelector('#archive-content');
  await page.click('#archive-content > article');
  await page.waitForSelector('#seasons');
  const SelectTemp = (await page.$$('#seasons > .se-c'))[temp - 1];
  const SelectEp = (await SelectTemp.$$('.episodiotitle > a'))[ep - 1];
  await SelectEp.click();
  await page.waitForSelector('iframe');
  const MainIframe = await (await page.$('iframe')).contentFrame();
  await (await MainIframe.$('#videocontainer')).click();
  // await MainIframe.waitForSelector('#videocontainer');
  // const videoFrame = await (await MainIframe.$('iframe')).contentFrame();
  // const video = await videoFrame.$('video');
  // console.log(video);
  // browser.close();
}

/**
 *
 * @param {import('venom-bot').Whatsapp} client
 * @param {import('venom-bot').Message} message
 * @param {*} CommandAndParams
 */
async function CommandAnime(client, message, CommandAndParams) {
  const anime = CommandAndParams.ConcatenatedParams;
  const temp = CommandAndParams.Params.temp || ['1'];
  const ep = CommandAndParams.Params.ep || ['1'];
  console.log(anime, temp, ep);
  if (!anime || !temp || !ep) {
    client.sendText(
      message.from,
      'O comando !Anime precisa dos parametros -temp e -ep'
    );
  }
  console.log(CommandAndParams);
  await GetEpUrl(anime, temp[0], ep[0]);
}

module.exports = CommandAnime;
