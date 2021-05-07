/*
    espruino-puck-code.js
    2021. Matthew Dunlap.

    This is the code that is uploaded to the Espruino Puck. It will
    tell the puck to advertise the following data in an array:
        - The puck's battery level
        - A requested fan state (0 = off; 1 = on)
        - The puck's temperature

    The fan state will be considered off if the puck is place face down;
    otherwise, if the puck is face up, the fan is considered on.
 */

/*
    //////////// global vars ////////////
 */

// determines whether the fan will be on or off
//  flipping the puck will make this equal 'true'
let fanState = false;

/*
    //////////// functions ////////////
 */

// advertise the battery level, fan state, and temperature via BLE
const updateAdvertising = function(){
    NRF.setAdvertising({}, {
        manufacturer: 0x0590,
        manufacturerData: [NRF.getBattery()*10, fanState, E.getTemperature()*10]
    });
};

// flash the three LEDs sequentially; only one LED is lit at a time
const blinkConnected = function(){
    lightsInBits = 0b001;
    let index = 0;
    const blinkLoop = setInterval( () => {
        if(lightsInBits <= 0b100){
            lightsInBits *= 2;
        } else {
            lightsInBits = 0b001;
        }
        digitalWrite([LED1, LED2, LED3], lightsInBits);
        index++;
        if(index > 24){
            allLightsOff();
            clearInterval(blinkLoop);
        }
    }, 30);
};

// turn all of the LEDs off at once
const allLightsOff = function(){
    digitalWrite([LED1, LED2, LED3], 0b0000);
};

// lets detect if the puck is being moved
require('puckjsv2-accel-movement').on();
let commandSent = false;
let idleTimeout;

/*
    //////////// event handling ////////////
 */

// if movement has been detected, check if the puck is up-side down
//  or not; if so change the fan state accordingly and update the advertising
//  to reflect the new state
Puck.on('accel', (data) => {
    if(idleTimeout) clearTimeout(idleTimeout);

    idleTimeout = setTimeout( () => {
        idleTimeout = undefined;
        if(data.acc.z < 0) fanState = 0;
        if(data.acc.z >= 0) fanState = 1;
        commandSent = false;
        updateAdvertising();
    }, 100);
});

/*
    //////////// run once ////////////
 */
// blink our lights when starting
blinkConnected();

// set the advertising interval for one minute
setInterval(updateAdvertising, 60000);

// update the advertising for the first time
updateAdvertising();