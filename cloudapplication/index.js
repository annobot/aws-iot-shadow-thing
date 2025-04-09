// client-app.js
const awsIot = require('aws-iot-device-sdk');
const readline = require('readline');
require('dotenv').config();
const { cloudClientConfig } = require('../config');
const { THING_NAME } = require('../constants');

const thingShadow = awsIot.thingShadow(cloudClientConfig);

// Setup terminal input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

thingShadow.on('connect', () => {
  console.log('[CloudApp] Connected');
  thingShadow.register(THING_NAME);

  // Start CLI prompt loop
  promptBrightness();
});

function promptBrightness() {
  rl.question('Enter desired brightness (0-100): ', (input) => {
    const brightness = parseInt(input.trim());

    if (isNaN(brightness) || brightness < 0 || brightness > 100) {
      console.log('Invalid input. Please enter a number between 0 and 100.');
    } else {
      console.log(`[CloudApp] Sending desired brightness = ${brightness}`);
      thingShadow.update(THING_NAME, {
        state: {
          desired: { brightness }
        }
      });
    }

    // Loop again
    promptBrightness();
  });
}

thingShadow.on('status', (thingName, statusType, token, state) => {
  console.log(`[CloudApp] Shadow ${statusType}:`, JSON.stringify(state.state));
});

thingShadow.on('error', (error) => {
  console.error('[CloudApp] Error:', error);
});

thingShadow.on('close', () => {
  console.log('[CloudApp] Connection closed');
});
