# motion-thermostat
Motion thermostat uses an Espruino Puck to send temperature data to a local server so 
that a device may be switched on once the ambient temperature exceeds the set temperature threshold. 
The user may flip the puck over (face-side down) to opt to have the fan turned off permanently.

This project utilizes IFTTT webhooks to receive commands to control other devices. For example, I 
originally started this project in order to control a vent fan that is plugged into a TPLink Kasa 
IoT plug.

## Setup
1) Using the Espruino web IDE, flash the code found in 'espruino-puck-code.js' to the Puck.
2) Clone this repository on your choice of server. I opted to use a Raspberry Pi 4 running Ubuntu 20.04.
   However, you may use any computer compatible with Node js 14+ and the @abandonware/noble library:
```
$ git clone https://github.com/boomninjavanish/motion-thermostat.git
```
3) In the newly created directory, install any node packages:
```
$ cd motion-thermostat
$ npm install
```
4) Add the following environmental variables via the command line. Be sure to replace the x's with 
   your Puck's mac address and the key found in the IFTTT webhook URL:
```
$ export PUCK_ADDRESS=xx:xx:xx:xx:xx:xx && export IFTTT_API_KEY=xxxxxxxxxxxxxxxxxx
```
5) Run the node script:
```
$ node motion-temperature --verbose
```


 
