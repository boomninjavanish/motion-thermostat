const https = require('https');
const noble = require("@abandonware/noble");

/*
    //////////// global vars ////////////
 */
// assign environmental variables
// the mac address of the puck; format: 00:00:00:00:00:00; see note:
//  note: for linux it is delimited by colons (':'); macos uses hyphens ('-')
const puckAddress = process.env.PUCK_ADDRESS;
const iftttApiKey = process.env.IFTTT_API_KEY;

// if the environmental vars have not been assigned, quit
if(!puckAddress || !iftttApiKey){
    console.error(`
Error: the environmental vars were not assigned. We have the following:
    \tPUCK_ADDRESS=${puckAddress}
    \tIFTTT_API_KEY=${iftttApiKey}
    
Please enter the following command in the terminal before running:
    \texport PUCK_ADDRESS=xx:xx:xx:xx:xx:xx && export IFTTT_API_KEY=xxxxxxxxxxxxxxxxxx
    
Replace the above letter x's in both variables with the appropriate data.`)
    process.exit(1);
}

let lastAdvertising = {}; // last advertising data received
let lastFanOn = false; // track the state of the fan
const tempThreshold = 23.9; // if current temp is higher than this, turn fan on
let verbose = false; // allows for more output for debugging
if(process.argv[2] === '--verbose') verbose = true;

console.log(JSON.stringify(process.argv));

/*
    //////////// functions ////////////
 */

// pad the hours, minutes, and seconds when outputting to the terminal
const padTime = function(number){
    return number.toString().padStart(2, '0');
}

// output a formatted date/time for logging (YYYY-MM-DD hh:mm:ss)
const getDateTime = function(){
    let dateObject = new Date();
    let date = `${dateObject.getFullYear()}-${padTime(dateObject.getMonth())}-${padTime(dateObject.getDay())}`;
    let time = `${padTime(dateObject.getHours())}:${padTime(dateObject.getMinutes())}:${padTime(dateObject.getSeconds())}`;
    return `${date} ${time}`;
}

// sends a request over https to turn fan on or off
// input: state = 'on' or 'off'
const switchFan = function(state){
    const fanOn = {
        hostname: 'maker.ifttt.com',
        port: 443,
        path: `/trigger/kitchen_fan_on/with/key/${iftttApiKey}`,
        method: 'GET'
    }

    const fanOff = {
        hostname: 'maker.ifttt.com',
        port: 443,
        path: `/trigger/kitchen_fan_off/with/key/${iftttApiKey}`,
        method: 'GET'
    }

    let request;

    switch (state) {
        case 'on':
            request = fanOn;
            break;
        default:
            request = fanOff;
            break;
    }

    const req = https.request(request, res => {
        console.log(`[${getDateTime()}] - HTTP request sent! Status code: ${res.statusCode}`);

        res.on('data', data => {
            process.stdout.write(data);
        });
    });

    req.on('error', error => {
        console.error(error);
    });

    req.end();
}

const onDeviceChanged = function(address, data){
   let batteryLevel = data[0] * 0.1;
   let currentTemp = data[2] * 0.1;
   let fanOn = false;

   // if the puck is face-side up and the temperature is right,
    // permit the fan to cycle
   if(data[1] === 1 && currentTemp > tempThreshold) fanOn = true;

   // output constant stream of data if --verbose is specified
   if(verbose) console.log(`[${getDateTime()}] - battery: ${batteryLevel}v, fanOn?: ${fanOn}, temp: ${currentTemp}`);

    // do not bother sending an HTTP request if nothing has changed
    if(fanOn === lastFanOn) return;

    if(fanOn) switchFan('on');
    else switchFan('off');
    lastFanOn = fanOn;
}

const onDiscovery = function(peripheral){
    // make sure this is our device
    if(peripheral.address !== puckAddress) return;

    // is the device a Espruino puck?
    if(!peripheral.advertisement.manufacturerData ||
        peripheral.advertisement.manufacturerData[0] !== 0x90 ||
        peripheral.advertisement.manufacturerData[1] !== 0x05) return;

    // get the advertised data without the UUIDs
    let data = peripheral.advertisement.manufacturerData.slice(2);

    // check if services have changed; if so, fire the device changed function
    if(lastAdvertising[peripheral.address] !== data.toString())
        onDeviceChanged(peripheral.address, data);

    // update the data for our next check
    lastAdvertising[peripheral.address] = data;
}

/*
    //////////// event handling ////////////
 */

noble.on('stateChange', state => {
    if(state !== 'poweredOn') return;
    if(verbose) console.log('Starting scan...');
    noble.startScanning([], true);
});

noble.on('discover', onDiscovery);
noble.on('scanStart', () => {
    if(verbose) console.log('Scanning started.');
});

noble.on('scanStop', () => {
    if(verbose) console.log('Scanning stopped.');
});
