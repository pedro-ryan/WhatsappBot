import Commands from '.';
import { generateCommand } from '../utils/commands';
import { bold, italic, monospace } from '../utils/text';

generateCommand(
  {
    Command(sock, command) {
      const CommandList = Object.entries(Commands.enabled);

      command.sendText(
        [
          bold(italic('Neste servidor temos os seguintes comandos:')),
          ...CommandList.map(([key, value]) => {
            return (
              bold('!' + key) + monospace(` => ${value?.infos.description}`)
            );
          }),
          '',
          monospace(
            'Para mais informações de um comando em especifico use !help seguido com o comando que você deseja ter mais informações como por exemplo:',
          ),
          bold('!help list'),
        ].join('\r\n'),
      );
    },
    SubCommand(sock, command) {
      const SelectedCommand = Commands.enabled[command.subCommand];
      if (!SelectedCommand)
        return command.sendText('Infelizmente este comando não existe 😔');

      const { infos } = SelectedCommand;
      const name = infos.toUse;

      let SubCommand: string[] = [];
      let Argument: string[] = [];

      console.log(SelectedCommand?.infos?.subCommands);
      console.log(SelectedCommand?.infos?.args);

      if (SelectedCommand?.infos?.subCommands) {
        const SubCommands = Object.entries(SelectedCommand.infos.subCommands);
        if (SubCommands.length > 0) {
          const SubCommandInfos =
            SelectedCommand.infos.subCommands[command.subArgs[0]];
          if (typeof command.subArgs[0] === 'string' && SubCommandInfos) {
            SubCommand = SubCommand.concat([
              '',
              bold(italic(`Sobre o sub comando ${command.subArgs[0]}`)),
              monospace(`ao usar este sub comando: ${SubCommandInfos.usedFor}`),
              monospace('para poder utilizar este sub comando use:'),
              bold(SubCommandInfos.howUse),
            ]);
          } else {
            SubCommand = SubCommand.concat([
              '',
              bold(
                italic(
                  `o comando ${name}, tem ${SubCommands.length} sub comandos sendo eles:`,
                ),
              ),
              ...SubCommands.map(([key, value]) => {
                return bold('!' + key) + monospace(` => ${value.usedFor}`);
              }),
              '',
              monospace(
                'caso queira saber mais de um sub comando use o comando help junto com o atual comando e o sub comando como por exemplo:',
              ),
              bold(`!help ${name} ${SubCommands[0][0]}`),
            ]);
          }
        }
      }

      if (SelectedCommand.infos.args) {
        const Arguments = Object.entries(SelectedCommand.infos.args);
        if (Arguments.length > 0) {
          Argument = Argument.concat([
            '',
            bold(
              italic(
                `O comando ${name} aceita ${Arguments.length} tipos de argumentos, sendo eles:`,
              ),
            ),
            ...Arguments.map(([key, value]) => {
              return bold('!' + key) + monospace(`=> ${value.usedFor}`);
            }),
          ]);
        }
      }

      command.sendText(
        [
          bold(italic(`Sobre o comando ${name}`)),
          monospace(`ao executar o comando ele ${infos.description}`),
          italic(`para utilizar o comando *${name}*, use:`),
          bold(`!${name}`),
          ...SubCommand,
          ...Argument,
        ].join('\r\n'),
      );
    },
  },
  {
    toUse: 'help',
    description:
      'Imprime todos os comandos do servidor e fornece algumas informações de uso',
  },
);

/* COMMAND
*_Neste servidor temos os seguintes comandos:_*
*!help*``` => Imprime todos os comandos do servidor```
*!list*``` => Imprime a Lista Atual do servidor```
*!oi*``` => apenas responde com um Olá```

```Para mais informações de um comando em especifico use !help seguido com o comando que você deseja ter mais informações como por exemplo:```
*!help list*
*/

/* SUBCOMMAND
Sobre o comando [COMANDO]
ao executar o comando ele [DESCRIPTION]

para utilizar o comando [COMANDO], use:
![COMANDO]

( quando houver subComando > )
o comando [COMANDO], tem [Quantidade] sub comandos sendo eles:
create => Cria uma nova lista, com as opções passadas ou pelo formulário
list => Lista todas as listas do atual grupo

caso queira saber mais de um sub comando use o comando help junto com o atual comando e o sub comando como por exemplo:
!help [COMANDO] [First Sub Command]

( quando sub comando for passado para visualização )
Sobre o sub comando [SUB COMMAND]
ao usar este argumento: [usedFor]
para poder utilizar este argumento use:
![COMANDO] [SUB COMMAND]

( quando houver argumentos )
O comando [COMANDO] aceita [Quantidade] tipos de argumentos, sendo eles:
noCenter => Não centraliza a lista
noRandom => Algo aleatório para encher linguiça :D

caso queira saber mais de um argumento uso o comando help junto com o atual comando e o argumento desejado por exemplo:
!help [COMANDO] --[ARGUMENTO]

( quando um argumento for passado para visualização )
Sobre o argumento [ARGUMENTO]
ao usar este argumento: [usedFor]
para poder utilizar este argumento use:
![COMANDO] --[ARGUMENTO]
*/
