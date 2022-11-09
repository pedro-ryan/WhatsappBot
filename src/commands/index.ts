import { CommandFC } from '../interfaces';
import list from './list';
import oi from './oi';

interface CommandList {
  [k: string]: CommandFC;
}

const Commands: CommandList = {
  oi,
  list,
};

export default Commands;
