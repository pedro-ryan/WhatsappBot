module.exports = class message {
  static async AwaitMessage(client, WaitMessage, timeout) {
    await client.onMessage((ConfirmMessage) => {
      if (ConfirmMessage.from === WaitMessage.from) {
        console.log(':D');
      }
    });
  }
};
