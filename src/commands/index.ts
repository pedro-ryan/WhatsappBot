import { CommandFC } from '../utils/interfaces';
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
