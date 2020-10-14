const CommandPlay = require('./play');
const CommandHi = require('./hi');
const CommandImage = require('./image');
const CommandHelp = require('./help');

const Commands = {
  play: CommandPlay,
  hi: CommandHi,
  image: CommandImage,
  help: CommandHelp,
};

module.exports = Commands;
