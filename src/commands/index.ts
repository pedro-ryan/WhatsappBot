import { CommandFC, GenericGenInfos } from '../utils/interfaces';

interface CommandList {
  enabled: {
    [k: string]: {
      infos: GenericGenInfos;
      execute: CommandFC | null;
    } | null;
  };
  Register: (infos: GenericGenInfos, commandFC: CommandFC) => void;
  UnRegister: (toUse: string) => void;
}

const Commands: CommandList = {
  enabled: {},
  Register(infos, commandFC) {
    console.log('Command Registered: ' + infos.toUse);
    this.enabled[infos.toUse] = {
      execute: commandFC,
      infos,
    };
  },
  UnRegister(toUse) {
    this.enabled[toUse] = null;
  },
};

export default Commands;
