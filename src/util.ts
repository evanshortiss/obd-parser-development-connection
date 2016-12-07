
import * as _ from 'lodash';
import * as OBD from 'obd-parser';

/**
 * Returns a list of PID instances e.g FuelLevel
 */
export function getPidInstances (): Array<OBD.PIDS.PID> {
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

/**
 * Finds and returns a specific PID based on its code
 */
export function getPidByCode (code: string):OBD.PIDS.PID {
  return _.find(getPidInstances(), (p:OBD.PIDS.PID) => {
    return p.getPid() === code;
  });
}

/**
 * Extracts the id of a PID being queried from a command string
 * e.g from "010C1" this will pluck "0C"
 */
export function getPidFromCommand (command: string) {
  return command.substr(2, 2);
}
