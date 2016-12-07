
import * as OBD from 'obd-parser';
import * as _ from 'lodash';
import * as _debug from 'debug';
import { EventEmitter } from 'events';

const debug = _debug('fake-connection');

function getPidInstances (): Array<OBD.PIDS.PID> {
  var ps = _.map(
    _.keys(OBD.PIDS),
    (p:string) => {
      if (p === 'PID') {
        // The base class should not be constructed
        return null;
      }

      return new OBD.PIDS[p]();
    }
  );

  return _.remove(ps, (pid) => {
    return pid !== null;
  });
}

function getPidByCode (code: string):OBD.PIDS.PID {
  return _.find(getPidInstances(), (p:OBD.PIDS.PID) => {
    return p.getPid() === code;
  });
}

function getPidFromCommand (command: string) {
  // e.g from "010C1" pluck "0C"
  return command.substr(2, 2);
}

class Connection extends EventEmitter {
  public ready:boolean = false;

  constructor () {
    super();
  }

  write (command: string) {
    debug(`received command "${command}"`);

    const pidCode:string = getPidFromCommand(command);
    const pid = getPidByCode(pidCode);

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

      this.emit('data', ret);
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