// device-app.js
require('dotenv').config();
const awsIot = require('aws-iot-device-sdk');
const { deviceClientConfig } = require('../config');
const { THING_NAME } = require('../constants');


const CLIENT_ID = deviceClientConfig.clientId;

function createDevice() {
  return awsIot.thingShadow(deviceClientConfig);
}

let localState = undefined

function registerThing(device) {
  console.log(`[${CLIENT_ID}] Registering...`);

  device.register(THING_NAME, {}, () => {
    console.log(`[${CLIENT_ID}] Registered`);


    device.get(THING_NAME);
  });
}

function bindHandlers(device) {
  device.on('delta', (thingName, state) => {
    console.log(`[${CLIENT_ID}] Delta received:`, state.state);
    //update local state with delta
    console.log("localstate", localState)
    localState = state.state
    device.update(thingName, {
      state: { reported: state.state }
    });
  });

  device.on('status', (thingName, stat, token, state) => {
    if (stat === 'accepted' && state?.state?.desired) {
      console.log(`[${CLIENT_ID}] Desired state from cloud:`, state.state.desired);

      if(!localState){
        //first update from cloud, no need to report stale local state
        localState = state.state.desired
        device.update(thingName, {
          state: { reported: localState }
        });
      } else {
        // this is the on subsequent updates, possibally after re connect, we send the stale reported state
        device.update(thingName, {
          state: { reported: localState }
        });
      }
    } else {
      console.log(`[${CLIENT_ID}] Status ${stat}:`, state);
    }
  });

  device.on('connect', () => {
    console.log(`[${CLIENT_ID}] Connected`);
    registerThing(device);
  });

  device.on('close', () => console.log(`[${CLIENT_ID}] Connection closed`));
  device.on('reconnect', () => console.log(`[${CLIENT_ID}] Reconnecting...`));
  device.on('offline', () => console.log(`[${CLIENT_ID}] Offline`));
  device.on('error', err => console.error(`[${CLIENT_ID}] Error:`, err));
}

// --- Initial Device Connection
const device = createDevice();
bindHandlers(device);

// Simulate disconnect after 15s
setTimeout(() => {
  console.log(`[${CLIENT_ID}] Simulating offline (disconnect + end)`);
  device.unregister(THING_NAME);
  device.end();

  setTimeout(() => {
    console.log(`[${CLIENT_ID}] Reconnecting...`);
    const deviceRe = createDevice();
    bindHandlers(deviceRe);
  }, 30000);
}, 30000);
