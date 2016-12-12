# obd-parser-development-connection
A connetion for the *obd-parser* module that is useful when developing. It will
return random data for any PID being requested.

## Usage
See the _/examples_ folder in *obd-parser* for a full example:

```ts
// In your code this should be changed to 'obd-parser'
import * as OBD from 'obd-parser';

// Use a serial connection to connect
var getConnector = require('obd-parser-fake-connection');

// Returns a function that will allow us to connect to the serial port
var connect:Function = getConnector({});

// Need to initialise the OBD module with a "connector" before starting
OBD.init(connect)
  .then(function () {
    // Do your polling stuff here!
  })
```

The above code will work exactly the same as JavaScript, just remove the type
annotation and change the _import_ line to _var OBD = require('obd-parser')_. 

## CHANGELOG

0.1.3 - Remove comment that is no longer valid

0.1.2 - Fix to include dist JS files

0.1.1 - Fix to include dist JS files

0.1.0 - Initial release