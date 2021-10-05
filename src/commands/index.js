const Commands = require('require-all')({
  dirname: __dirname,
});
const path = require('path');
const fs = require('fs');
const yaml = require('yaml');

delete Commands.index;

function removeDisable() {
  const PathCommandsYML = path.join(__dirname, '../../Commands.yml');
  if (fs.existsSync(PathCommandsYML)) {
    const CommandsYml = fs.readFileSync(PathCommandsYML, 'utf-8');
    const CommandsInfos = yaml.parse(CommandsYml);
    const DisableCommands = Object.keys(CommandsInfos).filter(
      (value) => !CommandsInfos[value].enable,
    );
    DisableCommands.map((Command) => {
      delete Commands[Command];
      return Command;
    });
  } else {
    throw new Error('Commands.yml Não existe');
  }
}

removeDisable();

module.exports = Commands;
