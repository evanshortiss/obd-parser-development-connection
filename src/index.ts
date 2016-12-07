
import * as OBD from 'obd-parser';
import * as _debug from 'debug';
import * as util from './util';
import { EventEmitter } from 'events';

const debug = _debug(require('../package.json').name);

class Connection extends EventEmitter {
  public ready:boolean = false;

  constructor () {
    super();
  }

  write (command: string) {
    debug(`received command "${command}"`);

    const pidCode:string = util.getPidFromCommand(command);
    const pid = util.getPidByCode(pidCode);

    if (pid) {
      debug(`found pid matching command "${command}"`);

      let value:string[] = pid.getRandomBytes();

      if (value.length === 1) {
        // If just a single value is returned make it a pair, e.g "F" => "0F"
        value.unshift('0');
      }
      
      // e.g "412FAA" could be a resposne to a fuel level query
      let ret:string = ['41', pidCode].concat(value).join('');
      
      ret += '\r>';

      this.emit('data', ret.toUpperCase());
    } else {
      debug(`no matching pid for command "${command}"`);
      this.emit('data', `UNKOWN COMMAND STRING "${command}"\r>`);
    }
  }
}

// This connection should respond with fake values for recognised codes such 
// as Engine RPM aka "0C", or "010C1" as a full command

export = function (): Function {
  debug(`returning connector function`);

  return function _obdFakeConnectorFn (configureFn: Function):Promise<Connection> {
    debug(`called fake connector function`);

    return new Promise(function (resolve, reject) {
      const c:Connection = new Connection();

      debug(`calling passed configure fn`);

      configureFn(c)
        .then(() => {
          debug(`configured. now ready`);
          c.ready = true;
          resolve(c);
        })
        .catch(reject);
    });
  };

};