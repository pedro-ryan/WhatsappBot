function CommandHi(client, message) {
  // console.log(message);
  return client.sendText(message.from, `Olá ${message.sender.formattedName}`);
  // .then((result) => {
  //   console.log('Result: ', result); // return object success
  // })
  // .catch((erro) => {
  //   console.error('Error when sending: ', erro); // return object error
  // });
}

module.exports = CommandHi;
