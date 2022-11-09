
interface CommandUtils {
  a: string
}

function commandUtils(this: CommandUtils) {
  this.a = ':D'
}


export default commandUtils;
