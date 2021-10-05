const ScriptMessage = require('../scripts/message');

async function CommandHi(client, message) {
  await ScriptMessage.AwaitMessage(client, message);
  return client.sendText(message.from, `Olá ${message.sender.formattedName}`);
}

module.exports = CommandHi;
